(function () {
  "use strict";

  const createEl = (el, style, innerText, placeholder, type) => {
    const element = document.createElement(el);
    if (style) element.style = style;
    if (innerText) element.innerText = innerText;
    if (placeholder) element.placeholder = placeholder;
    if (type) element.type = type;
    return element;
  };

  const myCode = localStorage.getItem("myCode");
  const link = location.origin;

  let linkToMarket = "";
  const query = "&sort=204&type=0&snew=";

  let mockedCzb = JSON.parse(localStorage.getItem("mockedCzb"));
  let mockedPercent = JSON.parse(localStorage.getItem("mockedPercent"));

  if (mockedCzb === null) {
    localStorage.setItem("mockedCzb", 0);
    mockedCzb = 0;
  }

  if (mockedPercent === null) {
    localStorage.setItem("mockedPercent", 100);
    mockedPercent = 100;
  }

  // --------------------------------------------------
  // Допоміжні функції продажу артефактів
  // --------------------------------------------------

  const fetchXml = (url, callback) => {
    if (!url) return;

    const xhr = new XMLHttpRequest();
    xhr.open("get", url);
    xhr.setRequestHeader("Content-type", "text/html; charset=windows-1251");

    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/html; charset=windows-1251");
    }

    xhr.addEventListener("load", () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xhr.responseText, "text/html");
      callback(doc);
    });

    xhr.send();
  };

  const getPrices = (doc) => {
    const priceBlock = doc.getElementsByClassName("wbwhite")[0];

    if (!priceBlock) return;

    const price = Number(
      priceBlock
        .getElementsByTagName("table")[3]
        .getElementsByTagName("td")[1]
        .innerText.replace(",", ""),
    );

    const strength = Number(
      priceBlock
        .getElementsByTagName("table")[1]
        .getElementsByTagName("td")[1]
        .innerText.match(/Прочность: .+/gi)[0]
        .match(/\d+/gi)[0],
    );

    const priceOneBattle = Math.round(price / strength);

    const artName = JSON.parse(localStorage.getItem("artNameLS"));

    let isIntact = artName.match(/\d+\/\d+/)[0].split("/");
    isIntact = Number(isIntact[0]) === Number(isIntact[1]);

    let myStrength = artName.match(/\d+\/\d+/)[0].split("/");
    myStrength = Number(myStrength[0]);

    const myPrice = Math.round(myStrength * priceOneBattle);

    let mockedPrice;

    if (mockedCzb !== 0 && mockedPercent !== 0) {
      mockedPrice = Math.round(
        myStrength * (mockedCzb * (mockedPercent / 100)),
      );
    } else if (mockedCzb !== 0 && mockedPercent === 0) {
      mockedPrice = Math.round(mockedCzb * myStrength);
    } else if (mockedCzb === 0 && mockedPercent !== 0) {
      mockedPrice = Math.round(
        priceOneBattle * myStrength * (mockedPercent / 100),
      );
    }

    const isBothZero = mockedCzb === 0 && mockedPercent === 0;
    const priceInput = document.getElementById("anl_price");

    if (!priceInput) return;

    if (isIntact && price > myPrice) {
      priceInput.value = isBothZero ? Math.round(myPrice * 0.95) : mockedPrice;
    } else if (isIntact) {
      priceInput.value = isBothZero ? Math.round(price * 0.95) : mockedPrice;
    } else {
      priceInput.value = isBothZero ? Math.round(myPrice * 0.95) : mockedPrice;
    }

    priceInput.dispatchEvent(new Event("keyup"));

    const mobileBlock = document.getElementById("set_mobile_max_width");
    const center = document.getElementsByTagName("center")[1];

    const infoBlock = createEl("div", "width: 900px");
    infoBlock.innerHTML = priceBlock.innerHTML;

    if (center === undefined) {
      mobileBlock?.appendChild(infoBlock);
    } else {
      center.appendChild(infoBlock);
    }
  };

  const getLinkToMarket = (doc) => {
    let block = doc.getElementsByClassName("art_info_left_block")[0];

    if (!block) return;

    block = [...block.getElementsByTagName("a")];

    const marketLink = block.find((el) => el.href.includes("auction"));

    if (marketLink) linkToMarket = marketLink.href;

    const artName = JSON.parse(localStorage.getItem("artNameLS"));

    let isIntact = artName.match(/\d+\/\d+/)[0].split("/");
    isIntact = Number(isIntact[0]) === Number(isIntact[1]);

    if (isIntact) {
      fetchXml(linkToMarket + query + 1, getPrices);
    } else {
      fetchXml(linkToMarket + query + 0, getPrices);
    }
  };

  // --------------------------------------------------
  // Продаж артефактів в інвентарі
  // --------------------------------------------------

  if (location.pathname.endsWith("/inventory.php")) {
    const refreshTabs = () => {
      const inventoryBlock = document.getElementById("inventory_block");
      if (!inventoryBlock) return;

      let arts = [...inventoryBlock.children];

      arts = arts.filter(
        (el) => !el.classList.contains("inventory_item_div_empty"),
      );

      arts.forEach((el) => {
        el.addEventListener("click", () => {
          const buttons = document.getElementById("inv_item_buttons");
          if (!buttons) return;

          if (buttons.lastChild?.id === "sellBtn") {
            buttons.lastChild.remove();
          }

          const myWrapper = createEl("div", "display: flex");
          myWrapper.id = "myWrapper";

          const inputsWrapper = createEl(
            "div",
            "display: flex; flex-direction: column; width: 55px",
          );
          inputsWrapper.id = "inputsWrapper";

          const czbInput = createEl("input", "", "", "цзб", "number");
          czbInput.value = mockedCzb;

          czbInput.addEventListener("change", () => {
            if (czbInput.value === "") czbInput.value = 0;

            localStorage.setItem("mockedCzb", Number(czbInput.value));

            mockedCzb = JSON.parse(localStorage.getItem("mockedCzb"));
            czbInput.value = mockedCzb;
          });

          const percentInput = createEl("input", "", "", "%", "number");
          percentInput.value = mockedPercent;

          percentInput.addEventListener("change", () => {
            if (percentInput.value === "") percentInput.value = 0;

            localStorage.setItem("mockedPercent", Number(percentInput.value));

            mockedPercent = JSON.parse(localStorage.getItem("mockedPercent"));

            percentInput.value = mockedPercent;
          });

          if (buttons.lastChild?.id === "myWrapper") {
            buttons.lastChild.remove();
          }

          const sellBtn = createEl(
            "button",
            "border-radius: 100%; border: 2px solid #dbb681; background-color: rgba(105, 62, 15, 0.651)",
          );

          const sellBtnImg = createEl("img");

          sellBtn.id = "sellBtn";
          sellBtn.title = "sell on market";

          sellBtnImg.classList.add("inv_item_select_img", "show_hint");

          sellBtn.classList.add("inv_item_select", "inv_item_select_img");

          sellBtnImg.src =
            "https://img.icons8.com/?size=80&id=cChy69pWtl7N&format=png";

          sellBtn.appendChild(sellBtnImg);

          const artInfoLink = document.getElementById(
            "inv_item_select_info_a",
          )?.href;

          localStorage.setItem("artInfoLink", JSON.stringify(artInfoLink));

          let artName =
            document.getElementById("inv_menu_art_name")?.textContent;

          if (!artName) return;

          artName = artName.replace("[", "").replace("]", "");

          sellBtn.addEventListener("click", () => {
            localStorage.setItem("artNameLS", JSON.stringify(artName));

            window.open(`${link}/auction_new_lot.php`, "_blank");
          });

          inputsWrapper.append(czbInput, percentInput);
          myWrapper.append(sellBtn, inputsWrapper);
          buttons.appendChild(myWrapper);
        });
      });
    };

    refreshTabs();

    const tabs = document.getElementsByClassName("filter_tabs_block")[0];

    if (tabs) {
      [...tabs.children].forEach((el) => {
        el.addEventListener("click", refreshTabs);
      });
    }
  }

  // --------------------------------------------------
  // Автоматичне заповнення сторінки виставлення артефакту
  // --------------------------------------------------

  if (location.pathname.endsWith("/auction_new_lot.php")) {
    const select = document.getElementById("sel");

    if (select) {
      const options = [...select.options];
      const artName = JSON.parse(localStorage.getItem("artNameLS"));

      const selectedIndex = options.findIndex((el) =>
        el.innerText.includes(artName),
      );

      if (selectedIndex >= 0) {
        select[selectedIndex].selected = true;
      }

      const amount = document.getElementById("anl_count");
      if (amount) amount.value = "1";

      const time = document.getElementById("duration");
      if (time) time.lastChild.selected = true;

      fetchXml(
        JSON.parse(localStorage.getItem("artInfoLink")),
        getLinkToMarket,
      );
    }
  }

  // --------------------------------------------------
  // Налаштування продажу ресурсів
  // --------------------------------------------------

  const resourceDefinitions = [
    {
      id: "wood",
      label: "Древесина",
      icon: "wood.png",
      defaultPrice: 182,
    },
    {
      id: "ore",
      label: "Руда",
      icon: "ore.png",
      defaultPrice: 182,
    },
    {
      id: "mercury",
      label: "Ртуть",
      icon: "mercury.png",
      defaultPrice: 363,
    },
    {
      id: "sulphur",
      label: "Сера",
      icon: "sulfur.png",
      defaultPrice: 363,
    },
    {
      id: "crystal",
      label: "Кристаллы",
      icon: "crystals.png",
      defaultPrice: 363,
    },
    {
      id: "gem",
      label: "Самоцветы",
      icon: "gems.png",
      defaultPrice: 363,
    },
  ];

  const RESOURCE_SETTINGS_KEY = "lordswmResourceMarketSettings";

  const DEFAULT_RESOURCE_SETTINGS = Object.fromEntries(
    resourceDefinitions.map((item) => [
      item.id,
      {
        price: item.defaultPrice,
        count: 50,
      },
    ]),
  );

  let resourceSettings;

  try {
    resourceSettings = {
      ...DEFAULT_RESOURCE_SETTINGS,
      ...(JSON.parse(localStorage.getItem(RESOURCE_SETTINGS_KEY)) || {}),
    };
  } catch {
    resourceSettings = { ...DEFAULT_RESOURCE_SETTINGS };
  }

  resourceDefinitions.forEach((item) => {
    const saved = resourceSettings[item.id] || {};

    resourceSettings[item.id] = {
      price: Math.max(1, Math.round(Number(saved.price) || item.defaultPrice)),
      count: Math.min(50, Math.max(1, Math.round(Number(saved.count) || 50))),
    };
  });

  const saveResourceSettings = () => {
    localStorage.setItem(
      RESOURCE_SETTINGS_KEY,
      JSON.stringify(resourceSettings),
    );
  };

  const parseResourceAmount = (element) => {
    const amountNode =
      element.querySelector("[data-hwm-topline-resource-amount]") ||
      element.querySelector("span") ||
      element.lastElementChild;

    if (!amountNode) return 0;

    return Number((amountNode.textContent || "").replace(/[^\d]/g, "")) || 0;
  };

  const resourceElements = (() => {
    const oldPanel = [
      ...document.getElementsByClassName("panel_res_link panel_res_link_add"),
    ];

    const newPanel = [...document.getElementsByClassName("sh_ResourcesItem")];

    const elements = oldPanel.length ? oldPanel : newPanel;
    const offset = oldPanel.length ? 2 : 1;

    return Object.fromEntries(
      resourceDefinitions.map((item, index) => [
        item.id,
        elements[offset + index] || null,
      ]),
    );
  })();

  // --------------------------------------------------
  // Виставлення ресурсу на ринок
  // --------------------------------------------------

  const sellResource = (resource, price, count) => {
    const form = new FormData();

    form.append("item", resource);
    form.append("count", count);
    form.append("atype", 1);
    form.append("price", price);
    form.append("duration", 8);
    form.append("sign", myCode);

    fetch(`${link}/auction_accept_new_lot.php`, {
      method: "POST",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Cache-Control": "max-age=0",
      },
      body: form,
    })
      .then((res) => {
        if (res.url.includes("msg_type=1")) {
          location.reload();
        } else if (res.url.includes("msg_type=2")) {
          const dialog = createEl(
            "div",
            "position:fixed; z-index:999999; width:320px; padding:18px; border:1px solid #8b6b3e; height:auto; display:flex; align-items:center; justify-content:center; text-align:center; border-radius:10px; background:#211b15; color:#f3dfbd; left:50%; top:20%; transform:translateX(-50%); box-shadow:0 8px 30px #0008;",
          );

          const msg = createEl(
            "div",
            "font-size:18px;",
            "Не удалось выставить ресурс на рынок",
          );

          dialog.appendChild(msg);
          document.body.appendChild(dialog);

          setTimeout(() => dialog.remove(), 2500);
        }
      })
      .catch((error) => {
        console.error("LordsWM resource market error:", error);
      });
  };

  // --------------------------------------------------
  // Меню налаштувань ресурсів
  // --------------------------------------------------

  const addResourceMarketMenu = () => {
    if (document.getElementById("lwm-resource-market")) return;

    const inventoryHeader = document.querySelector("#inv_art_amount");

    if (!inventoryHeader) return;

    const style = document.createElement("style");

    style.textContent = `
      /* Саме меню — старе позиціонування та оформлення */
      #lwm-resource-market {
        position: fixed;
        z-index: 999998;
        right: 18px;
        bottom: 18px;
        width: 270px;
        color: #ead7b7;
        font: 13px Arial, sans-serif;
      }

      #lwm-resource-market .lwm-panel {
        display: none;
        margin-bottom: 7px;
        padding: 12px;
        border: 1px solid #8d6a3d;
        border-radius: 9px;
        background: linear-gradient(145deg, #30261b, #17130f);
        box-shadow: 0 6px 24px #0009;
      }

      #lwm-resource-market.open .lwm-panel {
        display: block;
      }

      #lwm-resource-market .lwm-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        color: #f3d6a5;
        font-weight: bold;
      }

      #lwm-resource-market .lwm-row {
        display: grid;
        grid-template-columns: 28px 1fr 76px 64px;
        align-items: center;
        gap: 6px;
        margin: 7px 0;
      }

      #lwm-resource-market .lwm-row img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }

      #lwm-resource-market .lwm-name {
        font-size: 12px;
      }

      #lwm-resource-market input {
        box-sizing: border-box;
        width: 100%;
        min-width: 0;
        padding: 5px 4px;
        border: 1px solid #806442;
        border-radius: 5px;
        background: #100e0c;
        color: #f7e8cf;
        text-align: center;
      }

      #lwm-resource-market .lwm-labels {
        display: grid;
        grid-template-columns: 28px 1fr 76px 64px;
        gap: 6px;
        color: #bda98d;
        font-size: 10px;
        margin-bottom: 3px;
      }

      #lwm-resource-market .lwm-hint {
        color: #bda98d;
        font-size: 10px;
        margin-top: 9px;
        line-height: 1.4;
      }

      /* Кнопка окремо від меню — у заголовку інвентарю */
      #inv_art_amount {
        position: relative;
      }

      #inv_art_amount > .lwm-toggle {
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;

        width: 28px;
        height: 28px;
        padding: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        border: 1px solid #a9824e;
        border-radius: 50%;
        background: linear-gradient(180deg, #493722, #241b12);
        color: #f5dfb8;

        cursor: pointer;
        font-size: 17px;
        font-weight: bold;
        box-shadow: 0 3px 12px #0007;
      }
    `;

    document.head.appendChild(style);

    const root = createEl("div");
    root.id = "lwm-resource-market";

    const panel = createEl("div");
    panel.className = "lwm-panel";

    const heading = createEl("div");
    heading.className = "lwm-heading";
    heading.textContent = "Selling resource settings";
    panel.appendChild(heading);

    const labels = createEl("div");
    labels.className = "lwm-labels";
    labels.innerHTML =
      "<span></span><span>Resource</span><span>Price</span><span>Amount</span>";

    panel.appendChild(labels);

    resourceDefinitions.forEach((item) => {
      const row = createEl("div");
      row.className = "lwm-row";

      const img = createEl("img");

      const actualImg =
        resourceElements[item.id]?.querySelector("img") ||
        resourceElements[item.id]?.firstElementChild;

      img.src =
        actualImg?.src || `https://dcdn.lordswm.com/i/r/48/${item.icon}`;

      img.alt = item.label;
      img.title = item.label;

      const name = createEl("span", "", ""); //item.label);
      name.className = "lwm-name";

      const priceInput = createEl("input", "", "", "Price", "number");

      priceInput.min = "1";
      priceInput.step = "1";
      priceInput.value = resourceSettings[item.id].price;

      const countInput = createEl("input", "", "", "Amount", "number");

      countInput.min = "1";
      countInput.max = "50";
      countInput.step = "1";
      countInput.value = resourceSettings[item.id].count;

      const update = () => {
        const price = Math.max(
          1,
          Math.round(Number(priceInput.value) || item.defaultPrice),
        );

        const count = Math.min(
          50,
          Math.max(1, Math.round(Number(countInput.value) || 50)),
        );

        resourceSettings[item.id] = { price, count };

        priceInput.value = price;
        countInput.value = count;

        saveResourceSettings();
      };

      priceInput.addEventListener("change", update);
      countInput.addEventListener("change", update);

      row.append(img, name, priceInput, countInput);
      panel.appendChild(row);
    });

    const hint = createEl(
      "div",
      "",
      "Клік по іконці ресурсу виставляє його на ринок. Обмеження 50 та ваш запас.",
    );

    hint.className = "lwm-hint";
    panel.appendChild(hint);

    // Кнопка ⚙
    const toggle = createEl("button", "", "⚙");
    toggle.type = "button";
    toggle.className = "lwm-toggle";
    toggle.title = "Настройки продажи ресурсов";

    toggle.addEventListener("click", () => {
      root.classList.toggle("open");
    });

    // Невидимый заполнитель сохраняет прежнюю высоту контейнера меню.
    const spacer = createEl("div");
    spacer.style.height = "37px";
    spacer.style.marginTop = "7px";
    spacer.style.visibility = "hidden";

    // Меню залишається у body, кнопка переноситься в заголовок інвентарю.
    root.append(panel, spacer);
    document.body.appendChild(root);

    inventoryHeader.appendChild(toggle);
  };

  // Меню створюємо тільки на сторінці інвентарю.
  if (location.pathname.endsWith("/inventory.php")) {
    addResourceMarketMenu();
  }

  // --------------------------------------------------
  // Обробники натискання на іконки ресурсів
  // Працюють на всіх сторінках, де є панель ресурсів
  // --------------------------------------------------

  resourceDefinitions.forEach((item) => {
    const resourceElement = resourceElements[item.id];

    const img =
      resourceElement?.querySelector("img") ||
      resourceElement?.firstElementChild;

    if (!img || img.dataset.lwmMarketHandler === "1") return;

    img.dataset.lwmMarketHandler = "1";
    img.style.cursor = "pointer";
    img.title = `${item.label}: клик — выставить на рынок`;

    img.addEventListener("click", (event) => {
      event.stopPropagation();

      const available = parseResourceAmount(resourceElement);
      if (available <= 0) return;

      const settings = resourceSettings[item.id];

      const count = Math.min(available, settings.count, 50);

      sellResource(item.id, settings.price, count);
    });
  });
})();
