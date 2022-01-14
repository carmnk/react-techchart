import { parse } from "csv-parse/browser/esm/sync";

export async function parseCsvFileObj(data: File) {
  const res = await data.text().then((dataString) => {
    const rowDelimiter = [
      { chars: "\r\n", amt: dataString.match(/\r\n/gm)?.length ?? 0 },
      { chars: "\n", amt: dataString.match(/\n/gm)?.length ?? 0 },
      { chars: "\r", amt: dataString.match(/\r/gm)?.length ?? 0 },
    ];
    const rowDelimiterAmts = rowDelimiter.map((val) => val.amt);
    const maxAmtRowDelimiterIdx = rowDelimiterAmts.indexOf(Math.max(...rowDelimiterAmts));
    const guessedRowDelimiter = rowDelimiter[maxAmtRowDelimiterIdx].chars;

    const rows = dataString.split(guessedRowDelimiter);
    // only first line is checked for delimiter
    const delimiter = [
      { chars: ",", amt: rows[0].match(/,/gm)?.length ?? 0 },
      { chars: ";", amt: rows[0].match(/;/gm)?.length ?? 0 },
    ];
    const delimiterAmts = delimiter.map((del) => del.amt);
    const maxAmtDelimiterIdx = delimiterAmts.indexOf(Math.max(...delimiterAmts));
    const guessedDelimiter = delimiter[maxAmtDelimiterIdx].chars;

    // last delimiter is likely decimal delimiter
    const amtDecDel = { dots: 0, commas: 0 };
    rows.forEach((row) => {
      row.split(guessedDelimiter).forEach((cell) => {
        const lastDot = cell.lastIndexOf(".");
        const lastComma = cell.lastIndexOf(",");
        if (lastDot !== -1 && lastComma !== -1) {
          if (lastDot > lastComma) amtDecDel.dots++;
          else amtDecDel.commas++;
        } else if (lastDot !== -1 && lastComma === -1) amtDecDel.dots++;
        else if (lastDot === -1 && lastComma !== -1) amtDecDel.commas++;
      });
    });
    const isCommaDecDel = amtDecDel.dots < amtDecDel.commas;
    const isCommaDigitSeparator = amtDecDel.dots > amtDecDel.commas && amtDecDel.commas > 0;

    const newDataString = isCommaDecDel
      ? dataString.replaceAll(".", "").replaceAll(",", ".")
      : isCommaDigitSeparator
      ? dataString.replaceAll(",", "")
      : dataString;

    const parseRes = parse(newDataString.trim(), {
      delimiter: guessedDelimiter,
      record_delimiter: guessedRowDelimiter,
      cast: true,
      trim: true,
      cast_date: true,
    }).map((dataset: [Date, number, number, number, number, number]) => ({
      date: dataset[0],
      open: dataset[1],
      high: dataset[2],
      low: dataset[3],
      close: dataset[4],
      volume: dataset[5],
    })) as { date: Date; open: number; high: number; low: number; close: number; volume: number }[];
    parseRes.shift();
    return parseRes;
  });
  return res;
}
