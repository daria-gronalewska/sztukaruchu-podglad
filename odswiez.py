# Odświeża statyczny podgląd na podstawie lokalnej strony (php -S localhost:8090).
# Użycie: python3 odswiez.py  → potem wysłać zmiany na GitHub (strona publikuje się sama).
import re, os, shutil, urllib.request, json
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sztukaruchu-art')
OUT = os.path.dirname(os.path.abspath(__file__))
ADRES = os.environ.get('ADRES', 'http://localhost:8090/')

for f in os.listdir(OUT):
    if f.endswith('.html'): os.remove(os.path.join(OUT, f))
shutil.rmtree(os.path.join(OUT, 'media'), ignore_errors=True)

strony = {'': 'index'}
for root, dirs, files in os.walk(P):
    rel = os.path.relpath(root, P)
    if rel.split('/')[0] in ('panel', 'media', 'assets', 'inc', 'dane', '.git'): continue
    if 'index.php' in files and rel != '.': strony[rel + '/'] = rel.replace('/', '-')
for w in json.load(open(P + '/dane/wpisy.json')):
    if not w.get('ukryty'): strony[w['slug'] + '/'] = w['slug']

pliki_css = ['styl.css'] + sorted(x for x in os.listdir(P + '/assets/css') if x.endswith('.css') and x != 'styl.css')
css = ''.join(open(f'{P}/assets/css/{f}').read() + '\n' for f in pliki_css)
media = set('/' + m for m in re.findall(r"url\('?\.\./\.\./(media/[^')]+)", css))
css = css.replace('../../media/', '../media/')
css += '\n.podglad-pasek{position:fixed;left:0;right:0;bottom:0;z-index:200;background:#14091e;color:#ece5d6;font:500 13px/1.4 Montserrat,sans-serif;text-align:center;padding:8px 16px}\nbody{padding-bottom:40px}\n'
os.makedirs(OUT + '/assets', exist_ok=True)
open(OUT + '/assets/styl.css', 'w').write(css)
js = open(P + '/assets/js/main.js').read()
js = js[:js.find('// Zgoda na ciasteczka')]
js += "\ndocument.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const p=document.createElement('p');p.textContent='To podgląd — formularz zadziała na prawdziwej stronie.';p.style.cssText='margin-top:12px;font-weight:600;color:#a58ae7';f.append(p);}));\n"
open(OUT + '/assets/main.js', 'w').write(js)
PASEK = '<div class="podglad-pasek">Podgląd nowej strony ART Sztuka Ruchu — formularze zadziałają po publikacji</div>'

def popraw(h):
    h = re.sub(r'(<link rel="stylesheet" href="/assets/css/[^"]+">\n?)+', '<link rel="stylesheet" href="assets/styl.css">\n', h, count=1)
    h = re.sub(r'<link rel="stylesheet" href="/assets/css/[^"]+">\n?', '', h)
    h = re.sub(r'<script>window.PIKSEL_META.*?</script>', '', h)
    h = re.sub(r'<script src="/assets/js/main.js[^"]*" defer></script>', '<script src="assets/main.js" defer></script>', h)
    h = re.sub(r'<div class="zgoda" id="zgoda".*?</div>\s*</div>', '', h, flags=re.S)
    h = h.replace('<meta charset="UTF-8">', '<meta charset="UTF-8">\n<meta name="robots" content="noindex, nofollow">')
    h = h.replace('</body>', PASEK + '</body>')
    media.update(re.findall(r'/media/[^"\')\s&]+', h))
    h = re.sub(r'(["\'(])/media/', r'\1media/', h)
    h = re.sub(r'<link rel="canonical"[^>]*>', '', h)
    def link(m):
        path = m.group(2); base, _, frag = path.lstrip('/').partition('#')
        if base in strony: return m.group(1) + strony[base] + '.html' + ('#' + frag if frag else '') + m.group(3)
        return m.group(1) + 'https://sztukaruchu.art' + path + m.group(3)
    h = re.sub(r'(href=")(/[^"]*)(")', link, h)
    return h.replace('action="/kontakt/wyslij.php"', 'action="#"')

for adres, nazwa in strony.items():
    open(f'{OUT}/{nazwa}.html', 'w').write(popraw(urllib.request.urlopen(ADRES + adres).read().decode()))
brak = []
for m in media:
    if os.path.isfile(P + m):
        os.makedirs(os.path.dirname(OUT + m), exist_ok=True); shutil.copy(P + m, OUT + m)
    else: brak.append(m)
print(f'stron: {len(strony)}, zdjęć: {len(media)}', ('BRAK: ' + ', '.join(brak)) if brak else '')
