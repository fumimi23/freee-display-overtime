// MutationObserverを使って動的に生成される要素を監視
const observer = new MutationObserver(() => {
  const target = document.querySelector(".items.main-items");
  if (!target) return;

  const workDays = findValueByLabel(target, "労働日数");
  const totalWork = findValueByLabel(target, "総勤務時間");
  if (!workDays || !totalWork) return;

  const dayMatch = workDays.match(/\d+/);
  if (!dayMatch) return;

  const hourMatch = totalWork.match(/(\d+)\s*時間/);
  const minuteMatch = totalWork.match(/(\d+)\s*分/);
  if (!hourMatch && !minuteMatch) return;

  const day = parseInt(dayMatch[0], 10);
  const hour = hourMatch ? parseInt(hourMatch[1], 10) : 0;
  const minute = minuteMatch ? parseInt(minuteMatch[1], 10) : 0;

  const { overTimeHours, remainingMinutes, isNegative } = calculateOverTime(
    day,
    hour,
    minute
  );

  const signature = `${isNegative ? "-" : ""}${overTimeHours}h${remainingMinutes}m`;
  const existing = target.querySelector(".overtime-item");

  if (existing && existing.dataset.signature === signature) return;

  const html = `
    <div class="item">
      <div class="label">残業貯金</div>
      <div class="body">
        ${isNegative ? "-" : ""}${overTimeHours}<span class="unit">時間</span>
        ${remainingMinutes}<span class="unit">分</span>
      </div>
    </div>
  `;

  if (existing) {
    existing.innerHTML = html;
    existing.dataset.signature = signature;
  } else {
    const newItem = document.createElement("div");
    newItem.classList.add("overtime-item");
    newItem.dataset.signature = signature;
    newItem.innerHTML = html;
    target.appendChild(newItem);
  }
});

// body以下の変更を監視
observer.observe(document.body, { childList: true, subtree: true });

function findValueByLabel(root, labelText) {
  const items = root.querySelectorAll(".item");
  for (const item of items) {
    const label = item.querySelector(".label");
    const body = item.querySelector(".body");
    if (!label || !body) continue;
    if (label.textContent.trim().startsWith(labelText)) {
      return body.textContent;
    }
  }
  return null;
}

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
