"""
Translate Buffett and Munger Unscripted from English to Chinese using DeepSeek API.
Translates article titles, part names, and content line by line.
"""
import sys, io, json, time, os, re
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

import urllib.request
import urllib.error

API_KEY = "sk-a7510047c8f04e03afaa04dead2442e0"
API_URL = "https://api.deepseek.com/chat/completions"

def translate(text: str, max_retries=3) -> str:
    """Translate English text to Chinese using DeepSeek."""
    if not text.strip():
        return text

    payload = json.dumps({
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a professional financial translator. Translate the following English text to Chinese. "
                    "Keep names like 'Warren Buffett', 'Charlie Munger', 'WB', 'CM', 'Berkshire', 'GEICO', 'See's Candies' etc. as-is or use their standard Chinese names. "
                    "Preserve all punctuation structure. Output ONLY the translated Chinese text, nothing else."
                )
            },
            {"role": "user", "content": text}
        ],
        "max_tokens": 4096,
        "temperature": 0.1
    }).encode('utf-8')

    req = urllib.request.Request(
        API_URL,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }
    )

    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return data['choices'][0]['message']['content'].strip()
        except Exception as e:
            print(f"  Error (attempt {attempt+1}): {e}", flush=True)
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
    return text  # fallback to original

def translate_batch(texts):
    """Translate a batch of short texts together."""
    if not texts:
        return []
    # Join with numbered markers for batch translation
    combined = "\n".join(f"[{i+1}] {t}" for i, t in enumerate(texts))
    result = translate(combined)
    # Parse back
    lines = result.split('\n')
    output = [''] * len(texts)
    for line in lines:
        m = re.match(r'\[(\d+)\]\s*(.*)', line)
        if m:
            idx = int(m.group(1)) - 1
            if 0 <= idx < len(texts):
                output[idx] = m.group(2).strip()
    # Fill any missing with original
    for i, t in enumerate(output):
        if not t:
            output[i] = texts[i]
    return output

def main():
    raw_path = 'd:/AI编程/claude测试/VS code claude/buffett-ai/data/unscripted_raw.json'
    out_path = 'd:/AI编程/claude测试/VS code claude/buffett-ai/data/unscripted_zh.json'

    with open(raw_path, 'r', encoding='utf-8') as f:
        articles = json.load(f)

    # Check if partial output exists (resume support)
    done_slugs = set()
    result = []
    if os.path.exists(out_path):
        with open(out_path, 'r', encoding='utf-8') as f:
            result = json.load(f)
        done_slugs = {a['slug'] for a in result}
        print(f"Resuming: {len(done_slugs)} already done", flush=True)

    # Collect unique part names for batch translation
    part_names_en = list(set(a['part'] for a in articles))
    part_map = {}
    print(f"Translating {len(part_names_en)} part names...", flush=True)
    translated_parts = translate_batch(part_names_en)
    part_map = dict(zip(part_names_en, translated_parts))
    print("Part names translated:", flush=True)
    for en, zh in part_map.items():
        print(f"  {en} => {zh}", flush=True)

    total = len(articles)
    for i, article in enumerate(articles):
        slug = article['slug']
        if slug in done_slugs:
            continue

        title_en = article['title_en']
        print(f"[{i+1}/{total}] Translating: {title_en}", flush=True)

        # Translate title
        title_zh = translate(title_en)

        # Translate content entries
        entries_zh = []
        for entry in article['entries']:
            meeting = entry['meeting']
            lines = entry['lines']

            if not lines:
                entries_zh.append({'meeting': meeting, 'lines': []})
                continue

            # Translate all lines as a batch (join into one request for efficiency)
            combined_text = '\n\n'.join(lines)
            translated_combined = translate(combined_text)
            translated_lines = [l.strip() for l in translated_combined.split('\n\n') if l.strip()]

            # If split count doesn't match, just use translated as single block
            if len(translated_lines) != len(lines):
                translated_lines = [translated_combined.strip()]

            entries_zh.append({'meeting': meeting, 'lines': translated_lines})

        translated_article = {
            'slug': slug,
            'index': article['index'],
            'title_en': title_en,
            'title_zh': title_zh,
            'part_en': article['part'],
            'part_zh': part_map.get(article['part'], article['part']),
            'entries': entries_zh
        }
        result.append(translated_article)

        # Save after each article
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"  => {title_zh} (saved)", flush=True)
        time.sleep(0.3)  # Rate limiting

    print(f"\nDone! {len(result)} articles saved to {out_path}", flush=True)

if __name__ == '__main__':
    main()
