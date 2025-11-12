(function () {
  "use strict";
  //Constants
  const create_el = (el, style, innerText, className, placeholder) => {
    let element = document.createElement(el);
    if (style) element.style = style;
    if (innerText) element.innerText = innerText;
    if (className) element.className = className;
    if (placeholder) element.placeholder = placeholder;
    return element;
  };

  const convert_date = (date) => {
    let t = new Date(date);
    let seconds = t.getSeconds() < 10 ? `0${t.getSeconds()}` : t.getSeconds();
    let minutes = t.getMinutes() < 10 ? `0${t.getMinutes()}` : t.getMinutes();
    let hours = t.getHours() < 10 ? `0${t.getHours()}` : t.getHours();
    let day = t.getDate() < 10 ? `0${t.getDate()}` : t.getDate();
    let month =
      t.getMonth() + 1 < 10 ? `0${t.getMonth() + 1}` : t.getMonth() + 1;
    let year = t.getFullYear();
    return `${day}.${month}.${year}    ${hours}:${minutes}:${seconds}`;
  };

  const create_stat_block = (win = 0, lose = 0, label) => {
    const block = create_el("div", "display: flex;");
    const label_block = create_el(
      "div",
      "text-align: left; border-bottom: 1px solid black; padding: 2px; font-weight: bold; width: 160px;",
      `${label}`
    );
    const summ_block = create_el(
      "div",
      "text-align: left;border-bottom: 1px solid black; padding: 2px; font-weight: bold; width: 100px; color: black;",
      `Total: ${win + lose}`
    );
    const wins_block = create_el(
      "div",
      "text-align: left;border-bottom: 1px solid black; padding: 2px; font-weight: bold; width: 100px; color: greeb;",
      `Win: ${win}`
    );
    const loses_block = create_el(
      "div",
      "text-align: left;border-bottom: 1px solid black; padding: 2px; font-weight: bold; width: 100px; color: red;",
      `Lose: ${lose}`
    );
    const winrate_block = create_el(
      "div",
      "text-align: left;border-bottom: 1px solid black; padding: 2px; font-weight: bold; width: 100px;",
      `Winrate ${
        win + lose === 0 ? 0 : Math.round((win / (win + lose)) * 100)
      }%`
    );
    winrate_block.style.color = `${
      Math.round((win / (win + lose)) * 100) < 50 ? "red" : "green"
    }`;
    block.appendChild(label_block);
    block.appendChild(summ_block);
    block.appendChild(wins_block);
    block.appendChild(loses_block);
    block.appendChild(winrate_block);
    return block;
  };

  const link = location.origin;
  const char_id = location.href.match(/id=\d+/gi)[0].match(/\d+/gi)[0];
  const common_btn_style =
    "border: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #592c08; font-family: verdana,geneva,arial cyr; position: relative; text-align: center; font-weight: 700; background: url(../i/homeico/art_btn_bg_gold.png) #dab761; background-size: 100% 100%; border-radius: 5px; box-shadow: inset 0 0 0 1px #fce6b0,inset 0 0 0 2px #a78750,0 0 0 1px rgba(0,0,0,.13); line-height: 25px; cursor: pointer; transition: -webkit-filter .15s;transition: filter .15s;";

  //variable
  let db;
  let my_data;
  let parsed_to_end;
  let stop_page = 0;
  let current_page = 0;
  let all_pages_amount = 0;
  let parsed_pages_amount = 0;
  let records_visibility = false;
  let container_visibility = false;

  //async get
  const fetch_xml = (page, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open("get", `${link}/pl_warlog.php?id=${char_id}&page=${page}`);
    xhr.setRequestHeader("Content-type", "text/html; charset=windows-1251");
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType("text/html; charset=windows-1251");
    }

    xhr.addEventListener("load", () => {
      var parser = new DOMParser();
      var doc = parser.parseFromString(xhr.responseText, "text/html");
      var global_elem = doc.getElementsByClassName("global_a_hover")[1];
      var list = global_elem.innerHTML.split("\n&nbsp;&nbsp;");
      list.shift();
      callback(list, xhr, page);
    });
    xhr.send();
  };

  //Local Storage data
  const parsing_toogle = JSON.parse(localStorage.getItem("parsing_toogle"));
  if (parsing_toogle === null)
    localStorage.setItem("parsing_toogle", JSON.stringify(false));
  let start_stop = parsing_toogle;

  //UI
  const game_container =
    document.getElementsByClassName("hwm_pagination")[0].parentElement;
  const container = create_el(
    "div",
    "position: relative; border: 1px solid black; padding: 10px; min-width: 300px; display: none; margin-top: 20px;"
  );
  const menu = create_el("div");
  const info_block = create_el(
    "div",
    "display: flex; flex-direction: column; justify-content: center; gap: 5px;"
  );
  const no_info_block = create_el(
    "div",
    "display: none;",
    "Can`t find any data. Try to parse!"
  );
  const save_data_btn = create_el(
    "div",
    `${common_btn_style} width: 250px; display: none`,
    "SAVE DATA"
  );
  const start_search_btn = create_el(
    "div",
    `${common_btn_style} width: 150px;`,
    `${start_stop ? "Stop parsing" : "Start parsing"}`
  );
  const combat_types_btns_block = create_el(
    "div",
    "display: flex; justify-content: space-around; padding: 7px; gap: 4px; flex-wrap: wrap"
  );
  const delete_stats_btn = create_el(
    "div",
    "position: absolute; right: 10px; top: 10px; width: 25px; height: 25px; cursor: pointer; ",
    "✗"
  );

  const container_visibility_btn = create_el(
    "div",
    `${common_btn_style} width: 250px;`,
    "Search menu"
  );
  container_visibility_btn.addEventListener("click", () => {
    container_visibility = !container_visibility;
    container.style.display = `${container_visibility ? "block" : "none"}`;
  });
  const pages_amount_block = create_el("div", "font-weight: bold;");
  const parsed_pages_amount_block = create_el(
    "div",
    "font-weight: bold; margin-left: 2px"
  );
  const current_page_amount_block = create_el(
    "div",
    "font-weight: bold",
    `${current_page}`
  );

  menu.appendChild(start_search_btn);
  container.appendChild(menu);
  container.appendChild(no_info_block);
  container.appendChild(info_block);
  container.appendChild(save_data_btn);
  container.appendChild(combat_types_btns_block);
  container.appendChild(delete_stats_btn);
  game_container.appendChild(container_visibility_btn);
  game_container.appendChild(container);

  const check_all_pages_count = async (id) => {
    let res = await fetch(`${link}/pl_warlog.php?id=${id}&page=10005000`);
    let data = await res.text();
    let last_page = Number(data.match(/href="#">\d+/gi)[0].match(/\d+/gi)[0]);
    pages_amount_block.innerText = `/${last_page}`;
    all_pages_amount = last_page;
    open_db();
  };
  check_all_pages_count(char_id);

  const filter_protocol = (data, filter) => {
    return data.filter((el) => el.includes(filter)).join("");
  };

  const show_data = (data) => {
    const t = new Date(data.time);
    const time = create_el(
      "div",
      "font-weight: bold;",
      `Last time parsed: ${convert_date(t)}`
    );
    const char_id_block = create_el(
      "div",
      "font-weight: bold",
      `Account Id: ${data.id}`
    );
    const pages_info_block = create_el(
      "div",
      "display: flex; justify-content: center; font-weight: bold",
      `Parsed pages: `
    );
    const records_container = create_el(
      "div",
      "text-align: center; padding: 5px; display: none",
      "",
      "global_a_hover"
    );
    const records_block = create_el("div", "text-align: left");
    const stats_block = create_el(
      "div",
      "display: flex; flex-direction: column; align-items: center;"
    );
    const search_input = create_el(
      "input",
      "min-width: 300px; text-align: center;",
      "",
      "",
      "Enter search value and press key Enter"
    );
    const find_by_id = create_el(
      "input",
      "min-width: 300px; text-align: center;",
      "",
      "",
      "Enter hero id"
    );
    const opponent_stats_block = create_el(
      "div",
      "margin: 10px; display: flex; flex-direction: column; align-items: center;"
    );
    find_by_id.type = "number";

    search_input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        let words = search_input.value.split(" ");
        for (let i = 0; i < words.length - 1; i++) {
          words[i] = words[i].toLowerCase() + ".+";
        }
        words = words.join("");
        let filtered = data.data.filter(
          (el) => el.toLowerCase().match(new RegExp(words, "gi")) !== null
        );
        records_block.innerHTML = filtered.join("");
      }
    });
    find_by_id.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        let words = find_by_id.value.split(" ");
        for (let i = 0; i < words.length - 1; i++) {
          words[i] = words[i].toLowerCase() + ".+";
        }
        words = words.join("");
        let filtered = data.data.filter(
          (el) => el.toLowerCase().match(new RegExp(words, "gi")) !== null
        );
        records_block.innerHTML = filtered.join("");
        let all_w_a = 0;
        let all_l_a = 0;
        let all_w_t = 0;
        let all_l_t = 0;
        let kbo_w_a = 0;
        let kbo_l_a = 0;
        let kbo_l_t = 0;
        let kbo_w_t = 0;
        let tac_w_a = 0;
        let tac_l_a = 0;
        let tac_w_t = 0;
        let tac_l_t = 0;
        let pvp_w_a = 0;
        let pvp_l_a = 0;
        let pvp_w_t = 0;
        let pvp_l_t = 0;

        filtered.forEach((el) => {
          let warriors = el.match(/\[\d+]/gi);
          let me = el.match(
            new RegExp('<b><a class="pi" href="pl_info.php\\?id=' + char_id)
          );
          let opponent = el.match(
            new RegExp('<b><a class="pi" href="pl_info.php\\?id=' + words)
          );
          if (me === null) {
            me = false;
          } else if (me !== null) {
            me = true;
          }
          if (opponent === null) {
            opponent = false;
          } else if (opponent !== null) {
            opponent = true;
          }
          if (el.includes("ω")) {
            if (warriors.length === 0) return;
            if (warriors.length >= 2) {
              if (me === true && opponent === false) {
                all_w_a += 1;
                kbo_w_a += 1;
              } else if (me === false && opponent === true) {
                all_l_a += 1;
                kbo_l_a += 1;
              } else if (me === true && opponent === true) {
                all_w_t += 1;
                kbo_w_t += 1;
              } else if (me === false && opponent === false) {
                all_l_t += 1;
                kbo_l_t += 1;
              }
            }
          } else if (el.includes("τ")) {
            if (warriors.length === 0) return;
            if (warriors.length >= 2) {
              if (me === true && opponent === false) {
                all_w_a += 1;
                tac_w_a += 1;
              } else if (me === false && opponent === true) {
                all_l_a += 1;
                tac_l_a += 1;
              } else if (me === true && opponent === true) {
                all_w_t += 1;
                tac_w_t += 1;
              } else if (me === false && opponent === false) {
                all_l_t += 1;
                tac_l_t += 1;
              }
            }
          } else {
            if (warriors.length === 0) return;
            if (warriors.length >= 2) {
              if (me === true && opponent === false) {
                all_w_a += 1;
              } else if (me === false && opponent === true) {
                all_l_a += 1;
              } else if (me === true && opponent === true) {
                all_w_t += 1;
              } else if (me === false && opponent === false) {
                all_l_t += 1;
              }
            }
          }
        });
        opponent_stats_block.innerHTML = "<div></div>";
        opponent_stats_block.appendChild(
          create_stat_block(all_w_t, all_l_t, "Все бои вместе")
        );
        opponent_stats_block.appendChild(
          create_stat_block(all_w_a, all_l_a, "Все бои против")
        );
        opponent_stats_block.appendChild(
          create_stat_block(tac_w_t, tac_l_t, "Все гт бои вместе τ")
        );
        opponent_stats_block.appendChild(
          create_stat_block(tac_w_a, tac_l_a, "Все гт бои против τ")
        );
        opponent_stats_block.appendChild(
          create_stat_block(kbo_w_t, kbo_l_t, "Все кбо бои вместе ω")
        );
        opponent_stats_block.appendChild(
          create_stat_block(kbo_w_a, kbo_l_a, "Все кбо бои против ω")
        );
        records_block.insertAdjacentElement(
          "beforebegin",
          opponent_stats_block
        );
      }
    });

    const types = [
      { name: "Все бои", type: "" },
      { name: "Кбо бои", type: "ω" },
      { name: "Гильдия тактиков", type: "τ" },
      { name: "Гильдия Воров", type: "•" },
      { name: "Гильдия Наемников", type: "{" },
      { name: "Гильдия Стражей", type: "°" },
      { name: "Гильдия Искателей", type: "кампании" },
      { name: "Гильдия Лидеров", type: "◊" },
    ];
    const stats = {
      kboAll: { wins: 0, loses: 0 },
      kbo: { wins: 0, loses: 0 },
      tac: { wins: 0, loses: 0 },
      mercenary: { wins: 0, loses: 0 },
      thief: { wins: 0, loses: 0 },
      task: { wins: 0, loses: 0 },
      campaign: { wins: 0, loses: 0 },
      leader: { wins: 0, loses: 0 },
    };

    data.data.forEach((battle) => {
      if (battle.includes("ω")) {
        if (
          battle.includes(`<b><a class="pi" href="pl_info.php?id=${char_id}"`)
        ) {
          stats.kboAll.wins += 1;
          if (
            battle.match(/\[\d+\]/gi).length == 4 ||
            battle.match(/\[\d+\]/gi).length == 6
          )
            stats.kbo.wins += 1;
        } else {
          stats.kboAll.loses += 1;
          if (
            battle.match(/\[\d+\]/gi).length == 4 ||
            battle.match(/\[\d+\]/gi).length == 6
          )
            stats.kbo.loses += 1;
        }
      }
      if (battle.includes("τ")) {
        if (
          battle.includes(`<b><a class="pi" href="pl_info.php?id=${char_id}"`)
        ) {
          stats.tac.wins += 1;
        } else {
          stats.tac.loses += 1;
        }
      }
      if (battle.includes("Караван")) {
        if (
          battle.includes(`<b><a class="pi" href="pl_info.php?id=${char_id}"`)
        ) {
          stats.thief.wins += 1;
        } else {
          stats.thief.loses += 1;
        }
      }
      if (battle.includes("{")) {
        if (
          battle.includes(`<b><a class="pi" href="pl_info.php?id=${char_id}"`)
        ) {
          stats.mercenary.wins += 1;
        } else {
          stats.mercenary.loses += 1;
        }
      }
      if (battle.includes("°")) {
        if (
          battle.includes(`<b><a class="pi" href="pl_info.php?id=${char_id}"`)
        ) {
          stats.task.wins += 1;
        } else {
          stats.task.loses += 1;
        }
      }
      if (battle.includes("кампании")) {
        if (
          battle.includes(`<b><a class="pi" href="pl_info.php?id=${char_id}"`)
        ) {
          stats.campaign.wins += 1;
        } else {
          stats.campaign.loses += 1;
        }
      }
      if (battle.includes("◊")) {
        if (
          battle.includes(`<b><a class="pi" href="pl_info.php?id=${char_id}"`)
        ) {
          stats.leader.wins += 1;
        } else {
          stats.leader.loses += 1;
        }
      }
    });

    stats_block.appendChild(
      create_stat_block(stats.kboAll.wins, stats.kboAll.loses, "Все кбо бои")
    );
    stats_block.appendChild(
      create_stat_block(stats.kbo.wins, stats.kbo.loses, "Кбо бои с очками гт")
    );
    stats_block.appendChild(
      create_stat_block(stats.tac.wins, stats.tac.loses, "Гильдия тактиков")
    );
    stats_block.appendChild(
      create_stat_block(
        stats.leader.wins,
        stats.leader.loses,
        "Гильдия лидеров"
      )
    );
    stats_block.appendChild(
      create_stat_block(
        stats.mercenary.wins,
        stats.mercenary.loses,
        "Гильдия наемников"
      )
    );
    stats_block.appendChild(
      create_stat_block(stats.thief.wins, stats.thief.loses, "Гильдия воров")
    );
    stats_block.appendChild(
      create_stat_block(stats.task.wins, stats.task.loses, "Гильдия лидеров")
    );
    stats_block.appendChild(
      create_stat_block(
        stats.campaign.wins,
        stats.campaign.loses,
        "Гильдия искателей"
      )
    );

    stop_page = data.parsed_to_end
      ? all_pages_amount - my_data.parsed_pages_amount
      : all_pages_amount;
    parsed_pages_amount = data.parsed_pages_amount;

    if (data.parsed_to_end === true) {
      start_search_btn.innerText = "Update protocol";
      let update_pages_amount = all_pages_amount - data.parsed_pages_amount;
      stop_page = update_pages_amount + 1;
      current_page = 0;
    } else {
      current_page = data.parsed_pages_amount;
    }
    for (let i = 0; i < types.length; i++) {
      const btn = create_el(
        "div",
        "border-bottom: 1px solid black; font-weight: bold; cursor: pointer;",
        `${types[i].name}`
      );
      btn.addEventListener("click", () => {
        records_block.innerHTML = filter_protocol(
          data.data.flat(),
          types[i].type
        );
      });
      combat_types_btns_block.appendChild(btn);
    }

    parsed_pages_amount_block.innerText = data.parsed_pages_amount;

    const records_block_visibility_btn = create_el(
      "div",
      `${common_btn_style} width: 250px;`,
      "Records"
    );
    records_block_visibility_btn.addEventListener("click", () => {
      records_visibility = !records_visibility;
      records_container.style.display = `${
        records_visibility ? "block" : "none"
      }`;
    });

    records_container.appendChild(search_input);
    records_container.appendChild(find_by_id);
    records_container.appendChild(records_block);
    pages_info_block.append(parsed_pages_amount_block);
    pages_info_block.append(pages_amount_block);
    info_block.appendChild(time);
    info_block.appendChild(pages_info_block);
    info_block.appendChild(char_id_block);
    info_block.appendChild(stats_block);
    container.appendChild(records_block_visibility_btn);
    container.appendChild(records_container);
  };

  //Database functions
  const open_db = () => {
    let request = indexedDB.open("myDatabase", 1);
    let object_store_create;

    request.onupgradeneeded = async (event) => {
      db = event.target.result;
      object_store_create = db.createObjectStore("battleProtocol", {
        keyPath: "id",
      });
    };

    request.onerror = function (event) {};

    request.onsuccess = function (event) {
      db = event.target.result;
      get_data_from_DB(char_id);
    };
  };

  const get_data_from_DB = (id) => {
    let transaction = db.transaction(["battleProtocol"], "readwrite");
    let objectStore = transaction.objectStore("battleProtocol");

    let request = objectStore.get(id);

    request.onsuccess = function (event) {
      let data = event.target.result;
      if (!data) {
        no_info_block.style.display = "block";
        let block = create_el(
          "div",
          "display: flex; justify-content: center",
          "Parsed pages:"
        );
        block.append(current_page_amount_block);
        block.append(pages_amount_block);
        no_info_block.append(block);

        stop_page = all_pages_amount;
        parsed_to_end = false;
      } else {
        my_data = data;
        parsed_to_end = my_data.parsed_to_end;
        show_data(my_data);
      }
    };
  };

  const add_data_to_db = (pages) => {
    let transaction = db.transaction(["battleProtocol"], "readwrite");
    let object_store = transaction.objectStore("battleProtocol");
    let parsed_to_end = current_page == all_pages_amount ? true : false;

    let my_data = {
      id: char_id,
      parsed_pages_amount: parsed_pages_amount,
      parsed_to_end,
      data: pages.flat(),
      time: Date.now(),
    };
    let request = object_store.add(my_data);

    request.onsuccess = function (event) {
      location.reload();
    };
    request.onerror = function (event) {};
  };

  const update_db = (pages) => {
    var transaction = db.transaction(["battleProtocol"], "readwrite");
    var objectStore = transaction.objectStore("battleProtocol");

    let obj;
    if (my_data.parsed_to_end) {
      let updated = [...pages, ...my_data.data].flat();
      updated = updated.map((el) => el.replace("\n", ""));
      updated = [...new Set(updated)];

      //if (my_data.parsed_pages_amount === all_pages_amount) parsed_pages_amount = my_data.parsed_pages_amount;

      obj = {
        id: char_id,
        parsed_pages_amount: all_pages_amount,
        parsed_to_end,
        data: updated,
        time: Date.now(),
      };
    } else {
      let parsed_to_end = current_page == all_pages_amount ? true : false;
      obj = {
        id: char_id,
        parsed_pages_amount: parsed_pages_amount,
        parsed_to_end,
        data: [...my_data.data, ...pages].flat(),
        time: Date.now(),
      };
    }
    var request = objectStore.put(obj);

    request.onsuccess = function (event) {
      location.reload();
    };
    request.onerror = function (event) {};
  };

  const delete_from_db = (char_id) => {
    var transaction = db.transaction(["battleProtocol"], "readwrite");
    var objectStore = transaction.objectStore("battleProtocol");

    var request = objectStore.delete(char_id);
    request.onsuccess = function (event) {
      location.reload();
    };
  };

  delete_stats_btn.addEventListener("click", () => {
    let conf = confirm("Точно удалить?");
    if (conf) delete_from_db(char_id);
  });

  let parsed_pages = [];

  const page_parser = (list, xhr) => {
    parsed_pages = [...parsed_pages, list];
    current_page_amount_block.innerText = `${current_page}`;
    parsed_pages_amount_block.innerText = `${
      parsed_to_end ? my_data.parsed_pages_amount : current_page
    }`;
    if (xhr.status === 200) {
      current_page = current_page + 1;
      parsed_pages_amount = parsed_pages_amount + 1;
    }

    if (xhr.status === 200 && start_stop && current_page === stop_page) {
      if (my_data) {
        update_db(parsed_pages);
      } else {
        add_data_to_db(parsed_pages);
      }
      current_page_amount_block.innerText = `${current_page}`;
      current_page = 0;
      start_stop = !start_stop;
      localStorage.setItem("parsingToogle", start_stop);
    } else if (xhr.status === 200 && start_stop && current_page < stop_page) {
      fetch_xml(current_page, page_parser);
    } else if (xhr.status !== 200) {
      fetch_xml(current_page, page_parser);
    }
  };

  save_data_btn.addEventListener("click", () => {
    if (my_data) {
      update_db(parsed_pages);
    } else {
      add_data_to_db(parsed_pages);
    }
  });

  start_search_btn.addEventListener("click", () => {
    start_stop = !start_stop;
    localStorage.setItem("parsingToogle", start_stop);

    save_data_btn.style.display = "block";
    start_search_btn.innerText = `${
      start_stop ? "Stop parsing" : "Start parsing"
    }`;
    if (start_stop) fetch_xml(current_page, page_parser);
  });
})();
