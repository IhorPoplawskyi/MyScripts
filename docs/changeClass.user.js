(function () {
  "use strict";
  if (location.pathname === "/home.php") {
    let myCode = localStorage.getItem("myCode");
    let currentId = document.cookie.match(/pl_id=\d*/gi).join("");
    let myId = localStorage.getItem("myId");
    let updates_popup_changeClass_toogle = JSON.parse(
      localStorage.getItem("updates_popup_changeClass_toogle")
    );

    if (!myId) {
      localStorage.setItem("myId", currentId);
      location.reload();
    }

    if (updates_popup_changeClass_toogle === null) {
      localStorage.setItem(
        "updates_popup_changeClass_toogle",
        JSON.stringify(true)
      );
      location.reload();
    }

    let link = location.origin;

    let fetchCode = async () => {
      fetch(`${link}/castle.php?show_castle_f=1`)
        .then(function (response) {
          return response.text();
        })
        .then(function (html) {
          var parser = new DOMParser();
          var doc = parser.parseFromString(html, "text/html");
          var element = doc
            .getElementsByClassName("castle_yes_no_buttons")[0]
            .getElementsByTagName("a")[0].href;
          var code = element.slice(-32);
          var plId = document.cookie.match(/pl_id=\d*/gi);
          localStorage.setItem("myCode", code);
        })
        .catch(function (err) {});
    };

    if (!myCode) fetchCode();

    if (myId !== currentId) {
      fetchCode();
      localStorage.setItem("myId", currentId);
    }

    let newInterface = document.getElementsByClassName("home_pers_block")[0];

    let oldInterface = [...document.getElementsByTagName("b")];
    oldInterface = oldInterface.filter(
      (el) =>
        el.textContent === "Ваш Персонаж" || el.textContent === "Your Character"
    )[0];

    var parentNewInterface = document.getElementsByClassName(
      "home_container_block"
    )[4];

    let block = document.createElement("div");
    block.style = "display: flex; justify-content: center;";

    if (oldInterface) {
      if (location.href === `${link}/home.php`) {
        let charBtn = [...document.getElementsByTagName("b")];
        charBtn = charBtn.filter(
          (el) =>
            el.innerText == "Ваш Персонаж" || el.innerText == "Your Character"
        )[0];
        charBtn.style.cursor = "pointer";
        charBtn.title =
          'Нажмите на кнопку "Персонаж" для повторной загрузки своего уникального кода (в случае смены ника)';
        charBtn.addEventListener("click", () => fetchCode());
        oldInterface.appendChild(block);
      }
    }
    if (newInterface) {
      if (location.href === `${link}/home.php`) {
        let charBtn = [
          ...document.getElementsByClassName("global_container_block_header"),
        ];
        charBtn = charBtn.filter(
          (el) => el.innerText === "Персонаж" || el.innerText === "Character"
        )[0];
        charBtn.style.cursor = "pointer";
        charBtn.title =
          'Нажмите на кнопку "Персонаж" для повторной загрузки своего уникального кода (в случае смены ника)';
        charBtn.addEventListener("click", () => fetchCode());
        newInterface.insertBefore(block, newInterface.firstChild);
      }
    }

    const classes = [
      {
        name: "knight",
        imgHref: "https://cfcdn.lordswm.com/i/f/r1.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=1&sign=${myCode}`,
      },
      {
        name: "light_knight",
        imgHref: "https://cfcdn.lordswm.com/i/f/r101.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=101&sign=${myCode}`,
      },
      {
        name: "necr",
        imgHref: "https://cfcdn.lordswm.com/i/f/r2.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=2&sign=${myCode}`,
      },
      {
        name: "nps",
        imgHref: "https://cfcdn.lordswm.com/i/f/r102.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=102&sign=${myCode}`,
      },
      {
        name: "mage",
        imgHref: "https://cfcdn.lordswm.com/i/f/r3.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=3&sign=${myCode}`,
      },
      {
        name: "mage_destroyer",
        imgHref: "https://cfcdn.lordswm.com/i/f/r103.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=103&sign=${myCode}`,
      },
      {
        name: "elf",
        imgHref: "https://cfcdn.lordswm.com/i/f/r4.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=4&sign=${myCode}`,
      },
      {
        name: "blue_elf",
        imgHref: "https://cfcdn.lordswm.com/i/f/r104.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=104&sign=${myCode}`,
      },
      {
        name: "barb",
        imgHref: "https://cfcdn.lordswm.com/i/f/r5.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=5&sign=${myCode}`,
      },
      {
        name: "blood_barb",
        imgHref: "https://cfcdn.lordswm.com/i/f/r105.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=105&sign=${myCode}`,
      },
      {
        name: "witch_barb",
        imgHref: "https://cfcdn.lordswm.com/i/f/r205.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=205&sign=${myCode}`,
      },
      {
        name: "dark_elf",
        imgHref: "https://cfcdn.lordswm.com/i/f/r6.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=6&sign=${myCode}`,
      },
      {
        name: "dark_elf_tamer",
        imgHref: "https://cfcdn.lordswm.com/i/f/r106.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=106&sign=${myCode}`,
      },
      {
        name: "demon",
        imgHref: "https://cfcdn.lordswm.com/i/f/r7.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=7&sign=${myCode}`,
      },
      {
        name: "dark_demon",
        imgHref: "https://cfcdn.lordswm.com/i/f/r107.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=107&sign=${myCode}`,
      },
      {
        name: "dwarf",
        imgHref: "https://cfcdn.lordswm.com/i/f/r8.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=8&sign=${myCode}`,
      },
      {
        name: "flame_dwarf",
        imgHref: "https://cfcdn.lordswm.com/i/f/r108.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=108&sign=${myCode}`,
      },
      {
        name: "steppe_barb",
        imgHref: "https://cfcdn.lordswm.com/i/f/r9.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=9&sign=${myCode}`,
      },
      {
        name: "rage_steppe_barb",
        imgHref: "https://cfcdn.lordswm.com/i/f/r109.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=109&sign=${myCode}`,
      },
      {
        name: "pharaon",
        imgHref: "https://cfcdn.lordswm.com/i/f/r10.png?v=1.1",
        href: `${link}/castle.php?change_clr_to=10&sign=${myCode}`,
      },
    ];
    classes.forEach((el) => {
      let link = document.createElement("div");
      link.innerHTML = `<div title=${el.name}><img style='width: 19px; height: 19px; cursor: pointer;' src=${el.imgHref} alt=${el.name}/></div>`;
      link.addEventListener("click", () => {
        let fetchChange = async () => {
          fetch(el.href).then((response) => {
            if (response.status === 200) {
              location.reload();
            }
          });
        };
        fetchChange();
      });
      block.appendChild(link);
    });
  }
})();
