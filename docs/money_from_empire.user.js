(() => {
  const link = location.href;

  function getLastPage() {
    return new Promise((resolve) => {
      let xhr = new XMLHttpRequest();

      xhr.open("get", `${link}&page=100500`);

      xhr.setRequestHeader("Content-type", "text/html; charset=windows-1251");
      xhr.overrideMimeType("text/html; charset=windows-1251");

      xhr.onload = () => {
        let doc = new DOMParser().parseFromString(
          xhr.responseText,
          "text/html",
        );

        let pagination = doc.getElementsByClassName(
          "hwm_pagination global_inside_shadow",
        )[0];

        if (!pagination) {
          console.error("Не знайдена пагінація");
          resolve(1);
          return;
        }

        let lastPage = Number(pagination.lastElementChild.innerText);

        resolve(lastPage);
      };

      xhr.onerror = () => resolve(1);

      xhr.send();
    });
  }

  let last_page = 0;

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

  btn.onclick = async () => {
    if (started) return;

    started = true;

    btn.innerText = "🔍 Шукаю останню сторінку...";

    last_page = await getLastPage();

    console.log("Остання сторінка:", last_page);

    btn.innerText = `⏳ Збираю ${last_page} сторінок...`;

    for (let i = 0; i < last_page; i++) {
      fetchPage(i);
    }
  };

  document.body.appendChild(btn);
})();
