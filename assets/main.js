// Menu na telefonie
const hamburger = document.querySelector('.hamburger');
hamburger?.addEventListener('click', () => {
  const otwarte = document.body.classList.toggle('menu-otwarte');
  hamburger.setAttribute('aria-expanded', otwarte);
});
document.querySelectorAll('.menu__rozwin').forEach(b => b.addEventListener('click', () => {
  const li = b.closest('li');
  b.setAttribute('aria-expanded', li.classList.toggle('otwarte'));
}));

// Opinie: „Czytaj więcej”
document.querySelectorAll('.opinia__tekst').forEach(t => {
  if (t.scrollHeight <= t.clientHeight + 2) return;
  const b = document.createElement('button');
  b.className = 'opinia__wiecej';
  b.textContent = 'Czytaj więcej';
  b.addEventListener('click', () => { b.textContent = t.classList.toggle('otwarta') ? 'Ukryj' : 'Czytaj więcej'; });
  t.after(b);
});

document.querySelectorAll('[data-opinie]').forEach(b => b.addEventListener('click', () => {
  const r = document.querySelector('.opinie');
  r.scrollBy({ left: r.clientWidth * +b.dataset.opinie, behavior: 'smooth' });
}));

// Wydarzenia: filtr rodzaju (Koncert, Warsztat…)
document.querySelectorAll('.w-nadchodzace .filtr').forEach(b => b.addEventListener('click', () => {
  document.querySelectorAll('.w-nadchodzace .filtr').forEach(x => x.classList.toggle('aktywny', x === b));
  const f = b.dataset.filtr;
  document.querySelectorAll('.w-nadchodzace .wyr, .w-nadchodzace .kw').forEach(k => {
    const r = k.dataset.rodzaj ?? k.querySelector('[data-rodzaj]')?.dataset.rodzaj ?? '';
    k.hidden = !!f && r !== f;
  });
}));

// Zajęcia: filtr rodzaju i poziomu (można łączyć, np. „Body & Mind” + „Łagodne”)
const katalog = document.querySelector('.katalog');
if (katalog) {
  const stan = { kategoria: '', poziom: '' };
  const odswiez = () => {
    let ile = 0;
    katalog.querySelectorAll('.kz').forEach(k => {
      const ok = (!stan.kategoria || k.dataset.kategoria === stan.kategoria)
        && (!stan.poziom || (stan.poziom === 'start' ? k.dataset.start === '1' : k.dataset.poziom === stan.poziom));
      k.hidden = !ok; if (ok) ile++;
    });
    katalog.querySelector('.katalog__pusto').hidden = ile > 0;
  };
  katalog.querySelectorAll('.filtry').forEach(grupa => grupa.querySelectorAll('.filtr').forEach(b => b.addEventListener('click', () => {
    const g = grupa.dataset.grupa, w = b.dataset.wartosc;
    const wylacz = g === 'poziom' && stan.poziom === w;   // drugi klik w poziom wyłącza filtr
    stan[g] = wylacz ? '' : w;
    grupa.querySelectorAll('.filtr').forEach(x => x.classList.toggle('aktywny', !wylacz && x === b));
    odswiez();
  })));
  // klik w nazwę zajęć w planie tygodnia: pokaż kartę (nawet gdy była odfiltrowana) i ją podświetl
  document.querySelectorAll('[data-pokaz]').forEach(a => a.addEventListener('click', () => {
    const k = document.getElementById(a.dataset.pokaz);
    if (!k) return;
    if (k.hidden) { stan.kategoria = ''; stan.poziom = ''; katalog.querySelectorAll('.filtr').forEach(x => x.classList.toggle('aktywny', x.dataset.wartosc === '' && x.closest('[data-grupa=kategoria]'))); odswiez(); }
    k.classList.add('podswietl'); setTimeout(() => k.classList.remove('podswietl'), 2200);
  }));
}

// „Pokaż więcej” — długie listy pokazują na start tylko kilka pozycji
document.querySelectorAll('.pokaz-wiecej').forEach(lista => {
  const ile = +lista.dataset.naStart || 8;
  const el = [...lista.children];
  if (el.length <= ile) return;
  el.slice(ile).forEach(x => x.hidden = true);
  const box = document.createElement('div');
  box.className = 'pokaz-wiecej__btn';
  box.innerHTML = '<button type="button" class="btn btn--kontur">Pokaż więcej</button>';
  lista.after(box);
  box.querySelector('button').addEventListener('click', () => {
    const ukryte = el.filter(x => x.hidden);
    ukryte.slice(0, ile).forEach(x => x.hidden = false);
    if (ukryte.length <= ile) box.remove();
  });
});

// Pasek „Zapisz się” na telefonie chowa się przy samym dole strony (żeby nie zasłaniał stopki)
const pasek = document.querySelector('.pasek-mobilny');
if (pasek) {
  const sprawdz = () => pasek.classList.toggle('ukryty', window.innerHeight + window.scrollY > document.body.scrollHeight - 140);
  addEventListener('scroll', sprawdz, { passive: true }); sprawdz();
}

// Łagodne pojawianie się sekcji
const pojaw = document.querySelectorAll('.pojaw');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(wpisy => wpisy.forEach(w => {
    if (w.isIntersecting) { w.target.classList.add('widoczne'); io.unobserve(w.target); }
  }), { rootMargin: '0px 0px -60px 0px' });
  pojaw.forEach(el => io.observe(el));
} else pojaw.forEach(el => el.classList.add('widoczne'));


document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const p=document.createElement('p');p.textContent='To podgląd — formularz zadziała na prawdziwej stronie.';p.style.cssText='margin-top:12px;font-weight:600;color:#a58ae7';f.append(p);}));
