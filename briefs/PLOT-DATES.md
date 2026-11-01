# Brief for Datum Plot: dates and times (paste into Datum Plot's chat)

**Goal:** Datum Plot reads, shows, graphs and analyses dates and times, as an option the user turns on. It is also the receiving end of the one-way hand-off from Datum Plan (and later other Datum apps).

**Why:** today a date typed, pasted or imported into Plot becomes text that `doc::number` cannot read, so the cell stays empty. Datum Plan's **Datum Plot** button (Plan 0.5.15) writes time charts as "days from the first date" for this reason. Plot users with lab logs, sensor data, monitoring series or schedules all have dates.

**Optional, per column:** nothing changes for a table unless its X column (or a Y column, see "Later") is set to Date or Date and time. Older files open unchanged.

## 1. What is stored

- **Value:** a date is a number, the **days since 1970-01-01**. The fraction of a day is the time of day: 0.5 is noon, and 1.25 is 2 Jan 1970 06:00.
  - This is matplotlib's own date epoch since 3.3, so numbers go straight to its date axes.
  - It is also the day number Datum Plan uses (`date_of(day * DAY)`).
  - No time zones: values are local wall-clock times.
- **Format flag:** `Table.x_format: String` (JSON `xFormat`).
  - `""` means a number, as today.
  - `"date"` and `"datetime"` mark date columns.
  - `#[serde(default)]`, so older files read as numbers.
  - Later the same goes on `DataSet` (`format`) for date columns among the Y values.
- **File version:** `.dplot` stays format 1; the new field is optional.

## 2. Entering dates

- **Column format:** right-click the X column, then Format, with Number / Date / Date and time. Formatting a column of numbers as dates reads them as days since 1970. Undo works as usual.
- **Typing and pasting** into a date column accepts all of these:
  - ISO: `2026-11-05`, `2026-11-05 14:30`, `2026-11-05T14:30:00`;
  - day first or month first: `05/11/2026` (a new Options choice, "Dates are written day first / month first", defaulting to the system's order);
  - month names: `5-Nov-26`, `5 Nov 2026`, `Nov 5, 2026`;
  - a time on its own (`14:30`, as a fraction of a day) when the column is "Date and time".
- **Detection:** pasting or importing into a table whose X column is still a number column offers, once, "This column looks like dates. Treat it as dates?". This is the only automatic step, and the user chooses.
- **Import** (`py/datum/io.py` already turns Excel dates into ISO text): CSV, TSV and Excel date columns are detected the same way and offered as dates.
- **Parsing in Rust:** a new `doc::date_number(s, day_first) -> Option<f64>` beside `number`. It covers every format above, rejects impossible dates (31 Feb), and is unit-tested.

## 3. Showing dates

- **In the table:** cells show in the chosen display format, with the value kept as the number. The format is an option on the column: `5 Nov 2026` (default), `05-Nov-26`, `2026-11-05`, `05/11/2026`, `Nov 2026`, or with the time `14:30`.
- **Graphs, X axis:** a date axis with matplotlib's `AutoDateLocator` and `ConciseDateFormatter` by default.
- **Format Graph › X axis** adds, for date columns:
  - tick labels: Auto, Day month, Month year, ISO, Week number;
  - min and max typed as dates;
  - major step in days, weeks or months;
  - minor ticks.
- **Hover values and the data cursor** show the date.
- **Annotations** at a date (text, arrow, line) take a typed date. A vertical line at a date is the common case: "status date", "start of treatment".
- **Every exported graph** (PNG, TIFF, SVG, PDF, EPS) keeps the date ticks.

## 4. Analyses on dates

- **Fits and regressions** work on the numbers (days). Results name the units ("slope 0.42 per day"); the intercept is shown as a date where that makes sense.
- **Descriptive statistics** of a date column: min, max, median and mean show as dates; range and SD show in days.
- **Differences** between two date columns are in days, with the option of hours.
- **Column formulas** (`DataSet.formula`) can use date functions, at least `DATE(y,m,d)`, `TODAY()`, `YEAR()`, `MONTH()`, `DAY()` and `DATEDIF`-style day counts.

## 5. Exports

- **CSV and Excel:** write date columns as dates (ISO text in CSV, real dates in Excel), never as day numbers.

## 6. The hand-off contract with Datum Plan

What Plan will write once this is in a Plot release (Plan changes one function, `crates/core/src/io/dplot.rs`):

```json
{
  "format": 1,
  "name": "Tutorial: office fit-out - Project S-curve",
  "info": {
    "title": "Project S-curve",
    "experiment": "Datum Plan: Tutorial: office fit-out",
    "notes": "Copied from the Datum Plan plan … It is a copy: changes made here do not change the plan."
  },
  "tables": [{
    "id": 1, "name": "Project S-curve", "kind": "xy",
    "xTitle": "Date", "xUnits": "", "xFormat": "date",
    "yTitle": "Cumulative progress", "yUnits": "%",
    "rows": 3, "rowTitles": ["2026-10-12", "2026-10-19", "2026-10-26"],
    "sets": [{ "title": "Planned (baseline)", "entry": "rep", "reps": 1 }, { "title": "Actual", "entry": "rep", "reps": 1 }],
    "cols": [[20738, 20745, 20752], [0, 12.5, 31.0], [0, 10.0, null]]
  }],
  "graphs": [{ "id": 2, "table": 1, "name": "Project S-curve",
    "settings": { "line": true, "error": "none", "width": 160, "height": 100,
      "sets": [{ "color": "#A3ABB8", "symbol": "none", "line": true }, { "color": "#3B82F6", "symbol": "none", "line": true }] } }],
  "analyses": [], "layouts": [], "nextId": 3, "ui": {}
}
```

- X holds days since 1970 (20738 is 12 Oct 2026); `xFormat: "date"` tells Plot to show them as dates.
- Plot must open this file and draw the dates with no questions asked: the flag is already set.
- An older Plot ignores `xFormat` and would show 20738…. So Plan switches only after this ships. Say which Plot version has it, in Plot's CHANGELOG and MEMORY, and Plan's chat makes the change and requires that version.
- Other Datum apps (Sim, Bench, Calc) use the same contract later: `xFormat` and days since 1970.

## 7. Checks

- **Rust unit tests:**
  - every input format of `date_number`, both day orders, impossible dates refused;
  - an old file has no `xFormat` and stays numeric;
  - formatting a column and undoing restores it;
  - paste detection offers dates and does nothing until accepted.
- **Python tests:**
  - a date-axis graph renders and its SVG tick labels are dates;
  - export to every format;
  - a fit on dates reports "per day".
- **The Plan sample above** opens, shows the dates in the table, and draws a date axis.
- **UI tests:** format a column as dates, type `5-Nov-26`, and see `5 Nov 2026` and a date axis.
- **Docs:** the guide (both languages) gets a "Dates and times" section, plus the CHANGELOG, `docs/site.json` and a MEMORY decision ("dates are days since 1970-01-01, matplotlib's epoch; `xFormat` flags them").

## 8. Later (not in the first release)

- **Date columns among Y values:** `DataSet.format`.
- **Time-only columns:** durations shown as h:mm.
- **Gaps in the axis:** a working-day axis that skips weekends, as scheduling charts do.
