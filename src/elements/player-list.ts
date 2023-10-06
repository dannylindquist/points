import { define, on, watch } from "../lib/bind";
import { Player, store } from "../playerStore";

const playerNode = document.createElement("template");
playerNode.innerHTML = `
  <button class="w-full flex items-center border rounded px-2 py-3 border-gray-300">
    <div class="text-lg" data-bind="name"></div>
    <div class="text-lg ml-auto tabular-nums font-mono" data-bind="score"></div>
  </button
`;

define('points-player-list', ({ el }) => {
    on(el, "click", (event) => {
      event.stopPropagation();
      if (event.target instanceof HTMLElement) {
        const playerButton = event.target.closest("[data-id]");
        if (!playerButton || !(playerButton instanceof HTMLElement)) {
          return;
        }
        const id = playerButton.dataset.id;
        const player = store.value.find((item) => item.id == id);
  
        el.dispatchEvent(new CustomEvent('app:edit-palyer', { detail: player }))
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
  
    watch(store.players, (playerList) => {
        console.log(playerList)
      renderPlayers(playerList);
    })
  })