export class CsvFormatter {
  format({ byCategory, revenueHT, vat, revenueTTC }) {
    let output = 'categorie;montant_ht\n';
    for (const category of Object.keys(byCategory).sort())
      output += `${category};${byCategory[category]}\n`;
    output += `TOTAL HT;${revenueHT}\nTVA;${vat}\nTOTAL TTC;${revenueTTC}\n`;
    return output;
  }
}
