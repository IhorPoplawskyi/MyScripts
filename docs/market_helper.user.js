(function () {
  "use strict";

  const createEl = (el, style, innerText, placeholder, type) => {
    let element = document.createElement(el);
    if (style) element.style = style;
    if (innerText) element.innerText = innerText;
    if (placeholder) element.placeholder = placeholder;
    if (type) element.type = type;
    return element;
  };

  let items = [...document.querySelectorAll(".wb")];
  items.shift(); // пропускаємо заголовок

  let pricesForOne = [];
  let pricesForMult = [];

  const artsRepairPricesLS = JSON.parse(
    localStorage.getItem("artsRepairPricesLS"),
  );
  const artsRepairPrices = artsRepairPricesLS || {};
  let likablePrice = JSON.parse(localStorage.getItem("likablePriceLS") || "0");
  let useOnlyForOneT = JSON.parse(
    localStorage.getItem("useOnlyForOneLS") || "false",
  );
  let useOnlyForMultT = JSON.parse(
    localStorage.getItem("useOnlyForMultLS") || "false",
  );
  let enableSortT = JSON.parse(localStorage.getItem("enableSortLS") || "false");

  // --- UI
  let likablePriceInput = createEl("input");
  likablePriceInput.value = likablePrice;
  likablePriceInput.style.width = "40px";
  likablePriceInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      likablePrice = Number(likablePriceInput.value);
      localStorage.setItem("likablePriceLS", JSON.stringify(likablePrice));
      render(); // 🔹 підсвітка по новій введеній ціні
    }
  });

  let useOnlyForOne = createEl("input", "", "", "", "checkbox");
  useOnlyForOne.checked = useOnlyForOneT;
  useOnlyForOne.addEventListener("click", () => {
    useOnlyForOneT = !useOnlyForOneT;
    localStorage.setItem("useOnlyForOneLS", JSON.stringify(useOnlyForOneT));
    render();
  });

  let useOnlyForMult = createEl("input", "", "", "", "checkbox");
  useOnlyForMult.checked = useOnlyForMultT;
  useOnlyForMult.addEventListener("click", () => {
    useOnlyForMultT = !useOnlyForMultT;
    localStorage.setItem("useOnlyForMultLS", JSON.stringify(useOnlyForMultT));
    render();
  });

  let enableSort = createEl("input", "", "", "", "checkbox");
  enableSort.checked = enableSortT;
  enableSort.addEventListener("click", () => {
    enableSortT = !enableSortT;
    localStorage.setItem("enableSortLS", JSON.stringify(enableSortT));
    if (enableSortT) sortItems();
  });

  let operationBlock = createEl(
    "div",
    "display:flex; gap:6px; align-items:center;",
  );
  operationBlock.append(
    "Разово",
    useOnlyForOne,
    "Багато",
    useOnlyForMult,
    "Сортувати",
    enableSort,
  );

  let block = document.getElementsByClassName("wbwhite")[0];
  block = block.getElementsByTagName("tr")[0].lastChild;
  block.appendChild(likablePriceInput);
  block.appendChild(operationBlock);

  let artInfoLink = items[0].getElementsByTagName("a")[1].href;

  // --- OPTI
  const opti = (price, repair, currStrength, strength) => {
    let summ = price;
    let str = strength;
    let count = currStrength;
    let best = { price: Math.round(summ / count), str, count, repairs: 0 };
    for (let i = 1; i < strength; i++) {
      summ += repair;
      count += Math.floor(str * 0.9);
      str--;
      let currentPrice = Math.round(summ / count);
      if (currentPrice < best.price) {
        best = { price: currentPrice, str, count, repairs: i };
      } else break;
    }
    return best;
  };

  const getPrice = (item) => {
    let pricesBlock = [...item.getElementsByTagName("td")].filter(
      (el) => el.firstChild && el.firstChild.tagName == "IMG",
    );
    return +pricesBlock[0].nextSibling.innerText.replaceAll(",", "");
  };

  const getStrength = (item) => {
    let strengths = [
      ...item.getElementsByClassName("art_durability_hidden"),
    ][0];
    return strengths.innerText.split("/");
  };

  // --- Check prices
  const checkPriceForOneUse = () => {
    items.forEach((item, i) => {
      let strength = getStrength(item);
      let price = getPrice(item);
      let val = Math.round(price / Number(strength[0]));
      pricesForOne.push(val);
      item.children[2].appendChild(createEl("div", "color:red", `раз ${val}`));
    });
  };

  const checkPrice = (repair) => {
    items.forEach((item, i) => {
      let strength = getStrength(item);
      let price = getPrice(item);
      let data = opti(price, repair, +strength[0], +strength[1]);
      pricesForMult.push(data.price);

      let mid = item.children[2];
      mid.appendChild(createEl("div", "color:green", `багато ${data.price}`));
      mid.appendChild(createEl("div", "", `оптислом 0/${data.str}`));
      mid.appendChild(createEl("div", "", `боїв: ${data.count}`));
      mid.appendChild(createEl("div", "", `рем: ${data.repairs}`));
    });
  };

  // --- Sorting
  const sortItems = () => {
    if (!enableSortT) return;
    let parent = items[0].parentNode;
    let combined = items.map((item, i) => ({
      el: item,
      mult: pricesForMult[i] ?? Infinity,
    }));
    combined.sort((a, b) => a.mult - b.mult);
    combined.forEach((obj) => parent.appendChild(obj.el));
    items = combined.map((c) => c.el);
  };

  // --- Render підсвітки (тільки по likablePrice)
  const render = () => {
    items.forEach((item, i) => {
      if (likablePrice >= pricesForOne[i] && useOnlyForOneT) {
        item.style.background = "yellow";
      } else if (likablePrice >= pricesForMult[i] && useOnlyForMultT) {
        item.style.background = "yellow";
      } else {
        item.style.background = "";
      }
    });
  };

  // --- Fetch repair prices & init
  const fetchMy = async () => {
    const url = new URL(location.href);
    const artType = url.searchParams.get("art_type");

    let repair;
    if (artsRepairPrices[artType]) {
      repair = artsRepairPrices[artType];
    } else {
      let res = await fetch(artInfoLink);
      let text = await res.text();
      repair = Number(
        text
          .match(/<td>\d+,?\d+<\/td>/gi)[0]
          .match(/\d+,?\d+/)[0]
          .replace(",", ""),
      );
      artsRepairPrices[artType] = repair;
      localStorage.setItem(
        "artsRepairPricesLS",
        JSON.stringify(artsRepairPrices),
      );
    }

    checkPrice(repair);
    if (enableSortT) sortItems();
    render(); // 🔹 підсвітка по likablePrice після побудови
  };

  // --- Start
  checkPriceForOneUse();
  fetchMy();
})();
