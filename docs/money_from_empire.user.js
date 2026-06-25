(function () {
  "use strict";
  if (location.pathname.includes('/pl_transfers.php')) {

  const link = location.href;

  const last_page = Number(
    document.getElementsByClassName("hwm_pagination global_inside_shadow")[0]
      .lastElementChild.innerText,
  );

  let all = [];
  let completed = 0;
  let started = false;

  function group(field) {
    let obj = {};

    all.forEach((x) => {
      obj[x[field]] = (obj[x[field]] || 0) + x.gold;
    });

    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `<div>${k}: <b>${v.toLocaleString()}</b></div>`)
      .join("");
  }

  function showResult() {
    let old = document.getElementById("lordswm_box");
    if (old) old.remove();

    let total = all.reduce((s, x) => s + x.gold, 0);

    let box = document.createElement("div");

    box.id = "lordswm_box";

    box.style.cssText = `

position:fixed;
right:20px;
bottom:50px;

width:800px;
max-height:700px;

overflow:auto;

background:#111;
color:white;

z-index:999999;

padding:15px;

border:2px solid #888;
border-radius:10px;

font-size:14px;
`;

    box.innerHTML = `

<h2>🏆 LordsWM статистика</h2>

Сторінок:
<b>${last_page}</b><br>

Записів:
<b>${all.length}</b><br>

Всього золота:
<b>${total.toLocaleString()}</b>


<hr>

<h3>Типи</h3>

${group("type")}


<hr>

<h3>Результати</h3>

${group("result")}



<hr>

<h3>❓ Інше / не розпізнано</h3>


${
  all
    .filter((x) => x.type === "Інше")
    .map(
      (x) =>
        `
<div style="margin-bottom:12px">

<b>${x.gold.toLocaleString()}</b> золота<br>

${x.text}

</div>
`,
    )
    .join("<hr>") || "Немає"
}



<hr>

<h3>Останні 30</h3>

${all
  .slice(0, 30)
  .map(
    (x) => `${x.date} | ${x.gold.toLocaleString()} | ${x.type} | ${x.result}`,
  )
  .join("<br>")}


`;

    document.body.appendChild(box);

    let btn = document.getElementById("lordswm_btn");

    btn.innerText = "📊 Статистика";

    btn.onclick = () => {
      if (box.style.display === "none") {
        box.style.display = "block";
        btn.innerText = "❌ Сховати";
      } else {
        box.style.display = "none";
        btn.innerText = "📊 Статистика";
      }
    };
  }

  function parsePage(list, page) {
    list.forEach((row) => {
      let div = document.createElement("div");

      div.innerHTML = row;

      let text = div.innerText.replace(/\s+/g, " ").trim();

      let g = text.match(/Получено\s+(\d+)\s+золота/i);

      if (!g) return;

      let date = text.match(/^(\d\d-\d\d-\d\d\s+\d\d:\d\d)/);

      // ===== ТИП =====

      let type = "Інше";

      if (/дивиденды\s+предприятия/i.test(text)) type = "Дивіденди";
      else if (/турнир[а-яё]*\s+на\s+выживан[а-яё]*/i.test(text))
        type = "Турнир на выживание";
      else if (/лучш[а-яё]*/i.test(text)) type = "Лучший турнир";
      else if (/т[её]мн[а-яё]*\s+смешан[а-яё]*\s+турнир/i.test(text))
        type = "Тёмный смешанный турнир";
      else if (/трет[её]м[а-яё]*\s+турнир/i.test(text))
        type = "Третёмный турнир";
      else if (/смешан[а-яё]*\s+турнир/i.test(text)) type = "Смешанный турнир";
      else if (/мал[а-яё]*\s+турнир/i.test(text)) type = "Малый турнир";
      else if (/парн[а-яё]*\s+турнир/i.test(text)) type = "Парный турнир";
      else if (/т[её]мн[а-яё]*\s+турнир/i.test(text)) type = "Тёмный турнир";
      else if (/тронн[а-яё]*\s+битв/i.test(text)) type = "Тронная битва";
      else if (/быстр[а-яё]*\s+турнир/i.test(text)) type = "Быстрый турнир";

      // ===== РЕЗУЛЬТАТ =====

      let result = "Другое";

      if (/10%\s*игроков/i.test(text)) result = "Top 10%";
      else if (/перв(ое|ый)\s+место|перв(ый|ого)\s+результат/i.test(text))
        result = "1 место";
      else if (/втор(ое|ой)\s+место|втор(ой|ого)\s+результат/i.test(text))
        result = "2 место";
      else if (/трет(ье|ий)\s+место|трет(ий|его)\s+результат/i.test(text))
        result = "3 место";
      else if (/золото/i.test(text)) result = "Золото";
      else if (/серебро/i.test(text)) result = "Серебро";
      else if (/бронза/i.test(text)) result = "Бронза";
      else if (/участ/i.test(text)) result = "Участие";

      all.push({
        page,

        date: date ? date[1] : "",

        gold: Number(g[1]),

        type,

        result,

        text,
      });
    });

    completed++;

    console.log(`Сторінка ${completed}/${last_page}`);

    if (completed === last_page) {
      showResult();

      console.log("Готово");
    }
  }

  function fetchPage(page) {
    let xhr = new XMLHttpRequest();

    xhr.open("get", `${link}&page=${page}`);

    xhr.setRequestHeader("Content-type", "text/html; charset=windows-1251");

    xhr.overrideMimeType("text/html; charset=windows-1251");

    xhr.onload = () => {
      let doc = new DOMParser().parseFromString(xhr.responseText, "text/html");

      let elem = doc.getElementsByClassName("global_a_hover")[1];

      if (!elem) return;

      let list = elem.innerHTML.split("\n&nbsp;&nbsp;");

      list.shift();

      parsePage(list, page + 1);
    };

    xhr.send();
  }

  let btn = document.createElement("button");

  btn.id = "lordswm_btn";

  btn.innerText = "▶️ Зібрати турніри";

  btn.style.cssText = `

position:fixed;
right:20px;
bottom:20px;

z-index:1000000;

padding:10px 20px;

cursor:pointer;

background:#222;
color:white;

border-radius:8px;

`;

  btn.onclick = () => {
    if (started) return;

    started = true;

    btn.innerText = "⏳ Збираю...";

    for (let i = 0; i < last_page; i++) {
      fetchPage(i);
    }
  };

  document.body.appendChild(btn);
} else if (location.pathname.includes('/sms.php')) {
  if (document.getElementById("lordswm_tournament_btn")) {
    alert("Скрипт вже запущений");
    return;
  }

  const BASE = location.origin;
  const BY_PL_ID = 2;

  let all = [];
  let running = false;

  function request(url) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open("GET", url);

      xhr.overrideMimeType("text/html; charset=windows-1251");

      xhr.onload = () => resolve(xhr.responseText);

      xhr.onerror = reject;

      xhr.send();
    });
  }

  async function getLastPage() {
    const html = await request(
      `${BASE}/sms.php?by_pl_id=${BY_PL_ID}&page=9999`,
    );

    const doc = new DOMParser().parseFromString(html, "text/html");

    const pag = doc.querySelector(".hwm_pagination.global_inside_shadow");

    if (!pag) return 1;

    const nums = [...pag.querySelectorAll("*")]
      .map((x) => parseInt(x.textContent.trim()))
      .filter((x) => !isNaN(x));

    return Math.max(...nums, 1);
  }

  async function getMessageIds(page) {
    const html = await request(
      `${BASE}/sms.php?by_pl_id=${BY_PL_ID}&page=${page}`,
    );

    const doc = new DOMParser().parseFromString(html, "text/html");

    const ids = [];

    doc.querySelectorAll('a[href*="sms.php?sms_id="]').forEach((a) => {
      const subject = a.textContent.trim();

      if (!subject.toLowerCase().includes("турнир")) {
        return;
      }

      const href = a.getAttribute("href");

      const match = href.match(/sms_id=(\d+)/);

      if (!match) return;

      ids.push(match[1]);
    });

    return ids;
  }

  function detectType(text) {
    const t = text.toLowerCase();

    if (t.includes("тактический турнир лидеров")) {
      return "Тактический Турнир Лидеров";
    }

    if (t.includes("турнир лидеров")) {
      return "Турнир Лидеров";
    }

    const m = text.match(/Турнир\s+"([^"]+)"/i);

    if (m) return m[1];

    return "Інший турнір";
  }

  async function parseMessage(id) {
    const html = await request(
      `${BASE}/sms.php?sms_id=${id}&by_pl_id=${BY_PL_ID}`,
    );

    const doc = new DOMParser().parseFromString(html, "text/html");

    const text = doc.body.innerText.replace(/\s+/g, " ").trim();

    const gold = Number(
      (text.match(/золото:\s*([\d,]+)/i)?.[1] || "0").replace(/,/g, ""),
    );

    const gl = Number(text.match(/очки\s+ГЛ:\s*(\d+)/i)?.[1] || 0);

    const gt = Number(text.match(/очки\s+ГТ:\s*(\d+)/i)?.[1] || 0);

    const art = Number(
      text.match(/части\s+Имперского\s+артефакта:\s*(\d+)/i)?.[1] || 0,
    );

    return {
      id,
      type: detectType(text),
      gold,
      gl,
      gt,
      art,
    };
  }

  function showResult() {
    let old = document.getElementById("lordswm_tournament_box");

    if (old) old.remove();

    const totalGold = all.reduce((s, x) => s + x.gold, 0);

    const groups = {};

    all.forEach((x) => {
      if (!groups[x.type]) {
        groups[x.type] = {
          count: 0,
          gold: 0,
          gl: 0,
          gt: 0,
          art: 0,
        };
      }

      groups[x.type].count++;
      groups[x.type].gold += x.gold;
      groups[x.type].gl += x.gl;
      groups[x.type].gt += x.gt;
      groups[x.type].art += x.art;
    });

    const box = document.createElement("div");

    box.id = "lordswm_tournament_box";

    box.style.cssText = `
position:fixed;
right:20px;
bottom:70px;
width:900px;
max-height:750px;
overflow:auto;
background:#111;
color:white;
z-index:999999;
padding:15px;
border-radius:10px;
border:2px solid #666;
font-size:14px;
box-shadow:0 0 20px rgba(0,0,0,.5);
`;

    let html = `
<h2>🏆 Турнірна статистика</h2>

<div style="font-size:20px;margin-bottom:10px">
Загальне золото:
<b>${totalGold.toLocaleString()}</b>
</div>

<div>
Всього листів:
<b>${all.length}</b>
</div>

<hr>
`;

    Object.entries(groups)
      .sort((a, b) => b[1].gold - a[1].gold)
      .forEach(([name, v]) => {
        html += `
<div style="
border:1px solid #444;
padding:10px;
margin-bottom:10px;
">

<h3>${name}</h3>

Турнірів:
<b>${v.count}</b><br>

Золото:
<b>${v.gold.toLocaleString()}</b><br>

ГЛ:
<b>${v.gl}</b><br>

ГТ:
<b>${v.gt}</b><br>

Артефакти:
<b>${v.art}</b>

</div>
`;
      });

    html += `
<hr>

<h3>Останні турніри</h3>
`;

    [...all]
      .sort((a, b) => Number(b.id) - Number(a.id))
      .slice(0, 50)
      .forEach((x) => {
        html += `
<div style="margin-bottom:4px;">
${x.type}
 —
<b>${x.gold.toLocaleString()}</b>
 золота
</div>
`;
      });

    box.innerHTML = html;

    document.body.appendChild(box);

    btn.disabled = false;
    btn.innerText = "📊 Статистика";

    btn.onclick = () => {
      if (box.style.display === "none") {
        box.style.display = "block";

        btn.innerText = "❌ Сховати";
      } else {
        box.style.display = "none";

        btn.innerText = "📊 Статистика";
      }
    };
  }

  const btn = document.createElement("button");

  btn.id = "lordswm_tournament_btn";

  btn.innerText = "▶️ Турнірна статистика";

  btn.style.cssText = `
position:fixed;
right:20px;
bottom:20px;
z-index:1000000;
padding:10px 20px;
cursor:pointer;
background:#222;
color:white;
border-radius:8px;
border:1px solid #666;
font-size:14px;
`;

  document.body.appendChild(btn);

  btn.onclick = async () => {
    if (running) return;

    running = true;

    all = [];

    try {
      btn.innerText = "🔍 Сторінки...";

      const lastPage = await getLastPage();

      const ids = [];

      for (let page = 0; page < lastPage; page++) {
        btn.innerText = `📄 ${page + 1}/${lastPage}`;

        const found = await getMessageIds(page);

        ids.push(...found);
      }

      const uniqueIds = [...new Set(ids)];

      for (let i = 0; i < uniqueIds.length; i++) {
        btn.innerText = `📨 ${i + 1}/${uniqueIds.length}`;

        const data = await parseMessage(uniqueIds[i]);

        all.push(data);
      }

      showResult();
    } catch (e) {
      console.error(e);

      btn.innerText = "❌ Помилка";
    }

    running = false;
  };
}
})();