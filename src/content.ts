import { ShowFullWeek } from "./FullWeek";
import { UpdatePlayingStatus } from "./PlayingStatus";
import { AddDiffColumn } from "./TableDiff";
import { ShowWeekGames } from "./WeekGames";

const handleContentChanges = () => {
  AddDiffColumn();
  UpdatePlayingStatus();
  void ShowFullWeek();
  void ShowWeekGames();
};

// Handle dynamic content
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      handleContentChanges();
    }
  });
});

// Initial run
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    handleContentChanges();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
} else {
  handleContentChanges();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
