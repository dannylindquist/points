import { define, on, onCustomEvent, signal, watch } from "../lib/bind";
import { Player, PlayerStore } from "../playerStore";

const playerNode = document.createElement("template");
playerNode.innerHTML = `
  <button class="w-full flex items-center border rounded px-2 py-3 border-gray-300">
    <div class="text-lg" data-bind="name"></div>
    <div class="text-lg ml-auto tabular-nums font-mono" data-bind="score"></div>
  </button
`;

type SortDirection = "ASC" | "DESC";

define("points-player-list", async ({ el, refs }) => {
  const store = new PlayerStore();
  const { container, sortHigh, sortLow, sortBlock, resetButton } = refs;
  const sortDirection = signal<SortDirection>("ASC");

  on(sortHigh, "click", () => (sortDirection.value = "ASC"));
  on(sortLow, "click", () => (sortDirection.value = "DESC"));

  on(resetButton, "click", () => {
    store.clear();
  });

  on(el, "click", (event) => {
    event.stopPropagation();
    if (event.target instanceof HTMLElement) {
      const playerButton = event.target.closest("[data-id]");
      if (!playerButton || !(playerButton instanceof HTMLElement)) {
        return;
      }
      const id = playerButton.dataset.id;
      const player = store.value.find((item) => item.id == id);

      el.dispatchEvent(
        new CustomEvent("app:edit-player", { detail: player, bubbles: true })
      );
    }
  });

  onCustomEvent<string>("app:add-player", (event) => {
    store.addPlayer(event.detail);
  });

  onCustomEvent<{ playerId: String; scoreChange: number }>(
    "app:update-score",
    (event) => {
      const items = [...store.players.value];
      const foundPlayer = items.find(
        (item) => item.id == event.detail.playerId
      );
      if (foundPlayer) {
        foundPlayer.score += +(event.detail.scoreChange ?? 0);
        store.players.value = items;
      }
    }
  );
  onCustomEvent<string>("app:remove-player", (event) => {
    store.removePlayer(event.detail);
  });

  function renderPlayers(list: Player[], sortDirection: SortDirection) {
    const playersList = [...list].sort((a, b) => {
      if (sortDirection === "ASC") {
        return b.score - a.score;
      } else {
        return a.score - b.score;
      }
    });
    const fragment = document.createDocumentFragment();
    for (const player of playersList) {
      const node = playerNode.content.firstElementChild!.cloneNode(
        true
      ) as HTMLElement;
      node.querySelector("[data-bind=name]")!.textContent = player.name;
      node.querySelector("[data-bind=score]")!.textContent = `${player.score}`;
      node.dataset.id = `${player.id}`;
      fragment.appendChild(node);
    }
    container.replaceChildren(fragment);
  }

  watch(() => {
    renderPlayers(store.value, sortDirection.value);
    if (store.value.length < 2) {
      sortBlock.style.display = "none";
      resetButton.style.display = "none";
    } else {
      sortBlock.style.display = "";
      resetButton.style.display = "";
    }
  });

  watch(() => {
    const direction = sortDirection.value;
    if (direction === "ASC") {
      sortHigh.setAttribute("data-selected", "");
      sortLow.removeAttribute("data-selected");
    } else {
      sortLow.setAttribute("data-selected", "");
      sortHigh.removeAttribute("data-selected");
    }
  });

  await store.init();
});
