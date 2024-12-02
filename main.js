// MutationObserverを使って動的に生成される要素を監視
const observer = new MutationObserver((mutations) => {
  const target = document.querySelector(".items.main-items");
  if (!target) return;

  const items = target.querySelectorAll(".item");
  if (items.length < 2) return;

  const firstItem = items[0].querySelector(".body");
  const secondItem = items[1].querySelector(".body");
  if (!firstItem || !secondItem) return;

  const dayMatch = firstItem.textContent.match(/\d+/);
  const timeMatch = secondItem.textContent.match(/(\d+)時間(\d+)分/);
  if (!dayMatch || !timeMatch) return;

  const day = parseInt(dayMatch[0], 10);
  const hour = parseInt(timeMatch[1], 10);
  const minute = parseInt(timeMatch[2], 10);

  const { overTimeHours, remainingMinutes, isNegative } = calculateOverTime(
    day,
    hour,
    minute
  );

  // 新しい要素が既に存在する場合は追加処理をスキップ
  // これ消すと、ページが開けなくなっちゃった
  if (target.querySelector(".overtime-item")) return;

  const newItem = document.createElement("div");
  newItem.classList.add("overtime-item");
  newItem.innerHTML = `
    <div class="item">
      <div class="label">残業貯金</div>
      <div class="body">
        ${isNegative ? '-' : ''}${overTimeHours}<span class="unit">時間</span>
        ${remainingMinutes}<span class="unit">分</span>
      </div>
    </div>
  `;

  target.appendChild(newItem);
});

// body以下の変更を監視
observer.observe(document.body, { childList: true, subtree: true });

function calculateOverTime(day, hour, minute) {
  const workHoursPerDay = 8;
  const totalMinutesWorked = hour * 60 + minute;
  const standardMinutes = workHoursPerDay * day * 60;

  const overTimeMinutes = totalMinutesWorked - standardMinutes;

  const isNegative = overTimeMinutes < 0;
  const overTimeHours = Math.floor(Math.abs(overTimeMinutes) / 60);
  const remainingMinutes = Math.abs(overTimeMinutes) % 60;

  return {
    overTimeHours,
    remainingMinutes,
    isNegative,
  };
}
