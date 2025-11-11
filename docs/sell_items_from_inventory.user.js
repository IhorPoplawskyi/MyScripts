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

  let myCode = localStorage.getItem("myCode");

  let link = location.origin

  let linkToMarket = "";
  let query = "&sort=204&type=0&snew=";

  let mockedCzb = JSON.parse(localStorage.getItem("mockedCzb"));
  let mockedPercent = JSON.parse(localStorage.getItem("mockedPercent"));

  if (mockedCzb === null) JSON.stringify(localStorage.setItem("mockedCzb", 0));
  if (mockedPercent === null)
    JSON.stringify(localStorage.setItem("mockedPercent", 100));

  const fetchXml = (link, callback) => {
    if (!link) return;
    const xhr = new XMLHttpRequest();
    xhr.open("get", link);
    xhr.setRequestHeader("Content-type", "text/html; charset=windows-1251");
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/html; charset=windows-1251");
    }

    xhr.addEventListener("load", () => {
      let parser = new DOMParser();
      let doc = parser.parseFromString(xhr.responseText, "text/html");
      callback(doc);
    });
    xhr.send();
  };

  const getPrices = (doc) => {
    let priceBlock = doc.getElementsByClassName("wbwhite")[0];
    let price = Number(
      priceBlock
        .getElementsByTagName("table")[3]
        .getElementsByTagName("td")[1]
        .innerText.replace(",", "")
    );
    let strength = Number(
      priceBlock
        .getElementsByTagName("table")[1]
        .getElementsByTagName("td")[1]
        .innerText.match(/Прочность: .+/gi)[0]
        .match(/\d+/gi)[0]
    );
    let priceOneBattle = Math.round(price / strength);

    let artName = JSON.parse(localStorage.getItem("artNameLS"));
    let isIntact = artName.match(/\d+\/\d+/)[0].split("/");
    isIntact = Number(isIntact[0]) === Number(isIntact[1]);

    let myStrength = artName.match(/\d+\/\d+/)[0].split("/");
    myStrength = Number(myStrength[0]);
    let myPrice = Math.round(myStrength * priceOneBattle);

    let mockedPrice;
    if (mockedCzb !== 0 && mockedPercent !== 0) {
      mockedPrice = Math.round(
        myStrength * (mockedCzb * (mockedPercent / 100))
      );
    } else if (mockedCzb !== 0 && mockedPercent === 0) {
      mockedPrice = Math.round(mockedCzb * myStrength);
    } else if (mockedCzb === 0 && mockedPercent !== 0) {
      mockedPrice = Math.round(
        priceOneBattle * myStrength * (mockedPercent / 100)
      );
    }
    let isBothZero = mockedCzb === 0 && mockedPercent === 0;

    let priceInput = document.getElementById("anl_price");

    if (isIntact && price > myPrice) {
      priceInput.value = isBothZero ? Math.round(myPrice * 0.95) : mockedPrice;
    } else if (isIntact) {
      priceInput.value = isBothZero ? Math.round(price * 0.95) : mockedPrice;
    } else if (!isIntact) {
      priceInput.value = isBothZero ? Math.round(myPrice * 0.95) : mockedPrice;
    }

    priceInput.dispatchEvent(new Event("keyup"));

    let mobileBlock = document.getElementById("set_mobile_max_width");

    let center = document.getElementsByTagName("center")[1];

    let infoBlock = createEl("div", "width: 900px");
    infoBlock.innerHTML = priceBlock.innerHTML;
    if (center === undefined) {
      mobileBlock.appendChild(infoBlock);
    } else {
      center.appendChild(infoBlock);
    }
  };

  const getLinkToMarket = (doc) => {
    let block = doc.getElementsByClassName("art_info_left_block")[0];
    block = [...block.getElementsByTagName("a")];
    let link = block.filter((el) => el.href.includes("auction"))[0];
    if (link) linkToMarket = link.href;

    let artName = JSON.parse(localStorage.getItem("artNameLS"));
    let isIntact = artName.match(/\d+\/\d+/)[0].split("/");
    isIntact = Number(isIntact[0]) === Number(isIntact[1]);
    isIntact
      ? fetchXml(linkToMarket + query + 1, getPrices)
      : fetchXml(linkToMarket + query + 0, getPrices);
  };

  if (location.href === `${link}/inventory.php`) {
    const refreshTabs = () => {
      let my_arts = [...document.getElementById("inventory_block").children];
      my_arts = my_arts.filter(
        (el) => !el.classList.contains("inventory_item_div_empty")
      );
      my_arts.map((el) => {
        let id = el.id.match(/\d{1,3}/);
        let artInfo = arts[parseInt(id)];
        el.addEventListener("click", () => {
          let buttons = document.getElementById("inv_item_buttons");

          const myWrapper = createEl("div", "display: flex");
          myWrapper.id = "myWrapper";

          const inputsWrapper = createEl(
            "div",
            "display: flex; flex-direction: column; width: 55px"
          );
          inputsWrapper.id = "inputsWrapper";

          const czbInput = createEl("input", "", "", "цзб", "number");
          czbInput.value = mockedCzb;
          czbInput.addEventListener("change", () => {
            czbInput.value == "" ? (czbInput.value = 0) : czbInput.value;
            JSON.stringify(
              localStorage.setItem("mockedCzb", Number(czbInput.value))
            );
            mockedCzb = JSON.parse(localStorage.getItem("mockedCzb"));
            czbInput.value = mockedCzb;
          });

          const percentInput = createEl("input", "", "", "%", "number");
          percentInput.value = mockedPercent;
          percentInput.addEventListener("change", () => {
            percentInput.value == ""
              ? (percentInput.value = 0)
              : percentInput.value;
            JSON.stringify(
              localStorage.setItem("mockedPercent", Number(percentInput.value))
            );
            mockedPercent = JSON.parse(localStorage.getItem("mockedPercent"));
            percentInput.value = mockedPercent;
          });

          if (buttons.lastChild.id === "myWrapper") buttons.lastChild.remove();
          let sellBtn = createEl(
            "button",
            "border-radius: 100%; border: 2px solid #dbb681; background-color: rgba(105, 62, 15, 0.651)",
            ""
          );
          let sellBtnImg = createEl("img");
          sellBtn.id = "sellBtn";
          sellBtn.title = "sell on market";
          sellBtnImg.classList.add("inv_item_select_img", "show_hint");
          sellBtn.classList.add("inv_item_select", "inv_item_select_img");
          sellBtnImg.src =
            "https://img.icons8.com/?size=80&id=cChy69pWtl7N&format=png";
          sellBtn.appendChild(sellBtnImg);

          let artInfoLink = document.getElementById(
            "inv_item_select_info_a"
          ).href;
          localStorage.setItem("artInfoLink", JSON.stringify(artInfoLink));

          let artName = `${artInfo.name} ${artInfo.durability1}/${artInfo.durability2}`;

          sellBtn.addEventListener("click", () => {
            localStorage.setItem("artNameLS", JSON.stringify(artName));
            window.open(`${link}/auction_new_lot.php`, "_blank");
          });
          inputsWrapper.appendChild(czbInput);
          inputsWrapper.appendChild(percentInput);
          myWrapper.appendChild(sellBtn);
          myWrapper.appendChild(inputsWrapper);
          buttons.appendChild(myWrapper);
        });
      });
    };

    refreshTabs();

    let artsTabs = [
      ...document.getElementsByClassName("filter_tabs_block")[0].children,
    ];
    artsTabs.map((el) => el.addEventListener("click", refreshTabs));
  }

  if (location.href === `${link}/auction_new_lot.php`) {
    let select = document.getElementById("sel");
    let options = [...select.options];

    let artName = JSON.parse(localStorage.getItem("artNameLS"));
    select[
      options.findIndex((el) => el.innerText.includes(artName))
    ].selected = true;

    let amount = document.getElementById("anl_count");
    amount.value = "1";

    let time = document.getElementById("duration");
    time.lastChild.selected = true;

    fetchXml(JSON.parse(localStorage.getItem("artInfoLink")), getLinkToMarket);
  }

  //Selling resources from anywhere;

  let resources = [];
  let wood;
  let ore;
  let mercury;
  let sulphur;
  let crystal;
  let gem;

  if (
    document.getElementsByClassName("panel_res_link panel_res_link_add")
      .length !== 0
  ) {
    resources = [
      ...document.getElementsByClassName("panel_res_link panel_res_link_add"),
    ];
    wood = resources[2];
    ore = resources[3];
    mercury = resources[4];
    sulphur = resources[5];
    crystal = resources[6];
    gem = resources[7];
  } else {
    resources = [...document.getElementsByClassName("sh_ResourcesItem")];
    wood = resources[1];
    ore = resources[2];
    mercury = resources[3];
    sulphur = resources[4];
    crystal = resources[5];
    gem = resources[6];
  }

  const woodImg = wood.firstChild;
  const woodAmount = wood.lastChild.innerText;

  const oreImg = ore.firstChild;
  const oreAmount = ore.lastChild.innerText;

  const mercuryImg = mercury.firstChild;
  const mercuryAmount = mercury.lastChild.innerText;

  const sulphurImg = sulphur.firstChild;
  const sulphurAmount = sulphur.lastChild.innerText;

  const crystalImg = crystal.firstChild;
  const crystalAmount = crystal.lastChild.innerText;

  const gemImg = gem.firstChild;
  const gemAmount = gem.lastChild.innerText;

  const sellResource = (resource, price, count) => {
    let form = new FormData();
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
    }).then((res) => {
      if (res.url.includes("msg_type=1")) {
        location.reload();
      } else if (res.url.includes("msg_type=2")) {
        const dialog = createEl(
          "div",
          "position: absolute; width: 450px; padding: 10px; border: 1px solid grey; height: 150px; display:flex; align-items: center; text-content: center; border-radius: 10px; background: white; left: 40%; top: 20%;"
        );
        const msg = createEl(
          "div",
          "font-size: 36px;",
          "Something went wrong!"
        );
        dialog.appendChild(msg);
        document.body.appendChild(dialog);

        const timeout = setTimeout(() => {
          dialog.style.display = "none";
        }, 2000);
      }
    });
  };

  const images = [woodImg, oreImg, mercuryImg, sulphurImg, crystalImg, gemImg];

  images.forEach((img) => {
    img.style.cursor = "pointer";
  });

  woodImg.addEventListener("click", () => {
    let count = +woodAmount;
    count < 50 ? (count = count) : (count = 50);
    sellResource("wood", 182, count);
  });

  oreImg.addEventListener("click", () => {
    let count = +oreAmount;
    count < 50 ? (count = count) : (count = 50);
    sellResource("ore", 182, count);
  });

  mercuryImg.addEventListener("click", () => {
    let count = +mercuryAmount;
    count < 50 ? (count = count) : (count = 50);
    sellResource("mercury", 363, count);
  });

  sulphurImg.addEventListener("click", () => {
    let count = +sulphurAmount;
    count < 50 ? (count = count) : (count = 50);
    sellResource("sulphur", 363, count);
  });

  crystalImg.addEventListener("click", () => {
    let count = +crystalAmount;
    count < 50 ? (count = count) : (count = 50);
    sellResource("crystal", 363, count);
  });

  gemImg.addEventListener("click", () => {
    let count = +gemAmount;
    count < 50 ? (count = count) : (count = 50);
    sellResource("gem", 363, count);
  });

  // repair in 1 click
  if (location.pathname.includes("art_transfer.php")) {
    let input = [...document.getElementsByTagName("input")];
    input = input.filter((el) => el.value == "5")[0];
    input.click();
    let btn100 = [...document.getElementsByTagName("b")];
    btn100 = btn100.filter((b) => b.innerText === "100%")[0];
    btn100.click();
    let inputPlus1 = [...document.getElementsByTagName("input")];
    inputPlus1 = inputPlus1.filter((el) => el.value === "+1%")[0];
    inputPlus1.click();
  }
})();
