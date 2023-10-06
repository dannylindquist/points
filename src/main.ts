import { effect, signal } from "@preact/signals-core";
import { get, set } from "idb-keyval";
import { define, on, watch } from "./lib/bind";

type Player = {
  name: string;
  id: string;
  score: number;
};

const playerNode = document.createElement("template");
playerNode.innerHTML = `
  <button class="w-full flex items-center border rounded px-2 py-3 border-gray-300">
    <div class="text-lg" data-bind="name"></div>
    <div class="text-lg ml-auto tabular-nums font-mono" data-bind="score"></div>
  </button
`;

function createPlayer(name: string) {
  return {
    name,
    id: Math.random().toString(32).substring(2),
    score: 0,
  };
};

const currentSave = (await get("playerList")) || [];
const players = signal<Player[]>(currentSave);

define('player-add-form', ({ refs }) => {
  const { form } = refs;

  on(form, 'submit', (event) => {
    event.preventDefault();
    if (!(event.target instanceof HTMLFormElement)) {
      return;
    }
    const data = new FormData(event.target);
    const name = data.get("name");

    if (typeof name === "string") {
      window.dispatchEvent(new CustomEvent('app:player-add', { detail: createPlayer(name)}))
    }

    event.target.reset();
  });
});

define('points-player-list', ({ el }) => {
  on(el, "click", (event) => {
    event.stopPropagation();
    if (event.target instanceof HTMLElement) {
      const playerButton = event.target.closest("[data-id]");
      if (!playerButton || !(playerButton instanceof HTMLElement)) {
        return;
      }
      const id = playerButton.dataset.id;
      const player = players.value.find((item) => item.id == id);
      // App.$.playerDialog.querySelector("[data-bind=name]")!.textContent =
      //   player?.name ?? "";
      // (App.$.playerDialog.querySelector(
      //   "input[type=hidden]"
      // ) as HTMLInputElement)!.value = player?.id ?? "";
      // App.$.playerDialog.showModal();
    }
  })

  function renderPlayers(list: Player[]) {
    const playersList = [...list].sort(
      (a, b) => b.score - a.score
    );
    const fragement = document.createDocumentFragment();
    for (const player of playersList) {
      const node = playerNode.content.firstElementChild!.cloneNode(
        true
      ) as HTMLElement;
      node.querySelector("[data-bind=name]")!.textContent = player.name;
      node.querySelector("[data-bind=score]")!.textContent = `${player.score}`;
      node.dataset.id = `${player.id}`;
      fragement.appendChild(node);
    }
    el.replaceChildren(fragement);
  };

  watch(players, (playerList) => {
    renderPlayers(playerList);
    set("playerList", playerList);
  })
})

// App.$.playerDialog.addEventListener("click", (event) => {
//   if (!(event.target instanceof HTMLElement)) {
//     return;
//   }
//   if (
//     !(App.$.playerDialog.firstElementChild as HTMLElement).contains(
//       event.target
//     ) &&
//     App.$.playerDialog.open
//   ) {
//     App.$.playerDialog.close();
//   }
// });

// const changeForm = App.$.playerDialog.querySelector(
//   "form"
// ) as HTMLFormElement;
// changeForm.addEventListener("submit", (event) => {
//   event.preventDefault();
//   // @ts-ignore it works
//   const action = event.submitter!.value;
//   const data = new FormData(event.target as HTMLFormElement);
//   let score = +(data.get("score-change") || 0);
//   if (action === "subtract") {
//     score *= -1;
//   }
//   const playerId = data.get("playerId");
//   const items = [...App.players.value];
//   const foundPlayer = items.find((item) => item.id == playerId);
//   if (foundPlayer) {
//     foundPlayer.score += +(score ?? 0);
//     App.players.value = items;
//     (event.target as HTMLFormElement).reset();
//     App.$.playerDialog.close();
//   }
// });