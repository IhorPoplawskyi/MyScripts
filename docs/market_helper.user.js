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
  items.shift();

  let pricesForOne = [];
  let pricesForMult = [];

  let likablePriceLS = JSON.parse(localStorage.getItem("likablePriceLS"));
  if (likablePriceLS === null)
    localStorage.setItem("likablePriceLS", JSON.stringify(0));
  let likablePrice = likablePriceLS;

  let useOnlyForOneLS = JSON.parse(localStorage.getItem("useOnlyForOneLS"));
  if (useOnlyForOneLS === null)
    localStorage.setItem("useOnlyForOneLS", JSON.stringify(false));
  let useOnlyForOneT = useOnlyForOneLS;

  let useOnlyForMultLS = JSON.parse(localStorage.getItem("useOnlyForMultLS"));
  if (useOnlyForMultLS === null)
    localStorage.setItem("useOnlyForMultLS", JSON.stringify(false));
  let useOnlyForMultT = useOnlyForMultLS;

  let likablePriceInput = createEl("input");
  likablePriceInput.value = likablePriceLS;
  likablePriceInput.style.width = "30px";
  likablePriceInput.style.height = "19px";

  likablePriceInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      localStorage.setItem(
        "likablePriceLS",
        JSON.stringify(likablePriceInput.value)
      );
      likablePrice = Number(likablePriceInput.value);
      render();
    }
  });

  let useOnlyForOne = createEl("input", "", "", "", "checkbox");
  useOnlyForOne.checked = useOnlyForOneLS;
  useOnlyForOne.addEventListener("click", () => {
    useOnlyForOneT = !useOnlyForOneT;
    localStorage.setItem("useOnlyForOneLS", JSON.stringify(useOnlyForOneT));
    useOnlyForOne.checked = useOnlyForOneT;
    render();
  });
  let useOnlyForOneLabel = createEl("div", "", "Разово");

  let useOnlyForMult = createEl("input", "", "", "", "checkbox");
  useOnlyForMult.checked = useOnlyForMultLS;
  useOnlyForMult.addEventListener("click", () => {
    useOnlyForMultT = !useOnlyForMultT;
    localStorage.setItem("useOnlyForMultLS", JSON.stringify(useOnlyForMultT));
    useOnlyForMult.checked = useOnlyForMultT;
    render();
  });
  let useOnlyForMultLabel = createEl("div", "", "Багаторазово");

  let operationBlock = createEl("div", "display: flex; text-align: right");
  operationBlock.appendChild(useOnlyForOneLabel);
  operationBlock.appendChild(useOnlyForOne);
  operationBlock.appendChild(useOnlyForMultLabel);
  operationBlock.appendChild(useOnlyForMult);

  let block = document.getElementsByClassName("wbwhite")[0];
  block = block.getElementsByTagName("tr")[0].lastChild;
  block.appendChild(likablePriceInput);
  block.appendChild(operationBlock);

  let artInfoLink = items[0].getElementsByTagName("a")[1].href;

  const opti = (price, repair, currStrength, strength) => {
    let summ = price;
    let str = strength;
    let count = currStrength;
    let opt = [{ price: Math.round(summ / count), str: str }];

    for (let i = 1; i < strength; i++) {
      summ += repair;
      count += Math.floor(str * 0.9);
      str = str - 1;
      opt.push({ price: Math.round(summ / count), str: str });
    }
    return opt;
  };

  const checkPrice = (repair) => {
    items.forEach((item) => {
      let text = item.innerText;
      let strengths = [
        ...item.getElementsByClassName("art_durability_hidden"),
      ][0];
      let strength = strengths.innerText.split("/");
      let price = +text
        .match(/Купить\s+сразу!.*?(\d{1,3}(?:,\d{3})*|\d+)/s)[1]
        .replaceAll(",", "");
      let myPriceDiv = document.createElement("div");
      let myOptiSlomDiv = document.createElement("div");
      let data = opti(price, repair, +strength[0], +strength[1]);
      let czb = data.map((el) => el.price);
      czb = Math.min(...czb);
      let optiSlom = data.filter((el) => el.price === czb);
      optiSlom = optiSlom.map((el) => el.str);
      optiSlom = Math.min(...optiSlom);

      pricesForMult.push(czb);
      if (likablePrice >= czb && useOnlyForMultT) {
        item.style.background = "yellow";
      }
      myPriceDiv.innerText = `багато ${czb}`;
      myPriceDiv.style = "color: green";
      myOptiSlomDiv.innerText = `оптислом 0/${optiSlom}`;
      let mid = item.children[2];
      mid.appendChild(myPriceDiv);
      mid.appendChild(myOptiSlomDiv);
    });
  };

  const checkPriceForOneUse = () => {
    items.forEach((item) => {
      let text = item.innerText;
      let strengths = [
        ...item.getElementsByClassName("art_durability_hidden"),
      ][0];
      let strength = strengths.innerText.split("/");
      let price = +text
        .match(/Купить\s+сразу!.*?(\d{1,3}(?:,\d{3})*|\d+)/s)[1]
        .replaceAll(",", "");
      let myPriceDiv = document.createElement("div");
      let czb = Math.round(price / Number(strength[0]));
      pricesForOne.push(czb);
      myPriceDiv.innerText = `разовий ${czb}`;
      myPriceDiv.style = "color: red";
      if (likablePrice >= czb && useOnlyForOneT) {
        item.style.background = "yellow";
      }
      let mid = item.children[2];
      mid.appendChild(myPriceDiv);
    });
  };
  checkPriceForOneUse();

  const fetchMy = async () => {
    let res = await fetch(artInfoLink);
    let text = await res.text();
    let repair = Number(
      text
        .match(/<td>\d+,?\d+<\/td>/gi)[0]
        .match(/\d+,?\d+/gi)[0]
        .replace(",", "")
    );
    checkPrice(repair);
  };

  const render = () => {
    for (let i = 0; i < pricesForOne.length; i++) {
      if (likablePrice >= pricesForOne[i] && useOnlyForOneT) {
        items[i].style.background = "yellow";
      } else if (likablePrice >= pricesForMult[i] && useOnlyForMultT) {
        items[i].style.background = "yellow";
      } else {
        items[i].style.background = "";
      }
    }
  };

  fetchMy();
})();