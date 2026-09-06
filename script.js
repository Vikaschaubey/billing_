const PRODUCTS = [
  { name:"XYRUN PLUS",      form:"TAB",  hsn:"30024910", batch:"ZPT-214/26",   exp:"04/28", rate:47.00 },
  { name:"KEMO-P",          form:"TAB",  hsn:"30041030", batch:"ZPT-229A/26",  exp:"04/28", rate:48.00 },
  { name:"DF-SPAS",         form:"TAB",  hsn:"30041030", batch:"ZPT-151A/26",  exp:"04/28", rate:58.00 },
  { name:"YEPEZOLE-DSR",    form:"CAPS", hsn:"30049099", batch:"MC-042608 E2", exp:"03/28", rate:123.00 },
  { name:"YEPEZOLE-40",     form:"INJ",  hsn:"30049039", batch:"GD26D-001B",   exp:"01/27", rate:12.00 },
  { name:"QYMOCEF 500mg",   form:"INJ",  hsn:"30042019", batch:"CD26D-002A",   exp:"04/28", rate:16.50 },
  { name:"QYMOCEF 1GM",     form:"INJ",  hsn:"30042019", batch:"CD26D-002B",   exp:"04/28", rate:18.50 },
  { name:"CEZYME 200ML",    form:"SYR",  hsn:"2106",     batch:"ZBL-050",      exp:"04/28", rate:26.00 },
  { name:"LIK LIV 200ML",   form:"SYR",  hsn:"2106",     batch:"ZBL-049",      exp:"04/28", rate:28.00 },
  { name:"LIK MULTI 200ML", form:"SYR",  hsn:"2106",     batch:"ZBL-048",      exp:"04/28", rate:28.00 },
  { name:"LEKTRO LITE",     form:"ORS",  hsn:"21069099", batch:"AP/D/26030",   exp:"10/27", rate:76.00 },
  { name:"NARCO SOAP 100GM",form:"SOAP", hsn:"34011190", batch:"B26271",       exp:"07/29", rate:25.00 },
];

const itemsBody    = document.getElementById('itemsBody');
const itemsTable   = document.getElementById('itemsTable');
const totalsCell   = document.getElementById('totalsCell');
const supplyType   = document.getElementById('supplyType');
const taxRateInput = document.getElementById('taxRate');

let rowCounter = 0;

function money(n){
  return '₹ ' + n.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function buildProductOptions(selectedIdx){
  return PRODUCTS.map((p,i)=>`<option value="${i}" ${i===selectedIdx?'selected':''}>${p.name}</option>`).join('');
}

function addRow(productIdx = 0, qty = ''){
  rowCounter++;
  const tr = document.createElement('tr');
  tr.dataset.id = rowCounter;
  tr.innerHTML = `
    <td class="row-sno">${itemsBody.children.length + 1}</td>
    <td class="col-name">
      <select class="field product-select">${buildProductOptions(productIdx)}</select>
      <span class="print-only-text product-print"></span>
    </td>
    <td class="cell-form"></td>
    <td class="cell-hsn"></td>
    <td class="cell-batch"></td>
    <td class="cell-exp"></td>
    <td>
      <input type="number" class="qty-input" min="0" value="${qty}" />
      <span class="print-only-text qty-print"></span>
    </td>
    <td class="cell-rate"></td>
    <td class="col-taxable">₹ 0.00</td>
    <td class="col-tax col-igst">₹ 0.00</td>
    <td class="col-tax col-cgst">₹ 0.00</td>
    <td class="col-tax col-sgst">₹ 0.00</td>
    <td class="col-action no-print"><button type="button" class="row-del" title="Delete row">✕</button></td>
  `;
  itemsBody.appendChild(tr);
  fillRowStatic(tr);
  recalcAll();
}

function fillRowStatic(tr){
  const select = tr.querySelector('.product-select');
  const idx = parseInt(select.value, 10);
  const p = PRODUCTS[idx];
  tr.querySelector('.cell-form').textContent  = p.form;
  tr.querySelector('.cell-hsn').textContent   = p.hsn;
  tr.querySelector('.cell-batch').textContent = p.batch;
  tr.querySelector('.cell-exp').textContent   = p.exp;
  tr.querySelector('.cell-rate').textContent  = p.rate.toFixed(2);
  tr.querySelector('.product-print').textContent = p.name;
}

function recalcAll(){
  const mode = supplyType.value; // 'igst' or 'cgst'
  const totalRate = parseFloat(taxRateInput.value) || 0;
  const halfRate = totalRate / 2;

  itemsTable.classList.toggle('mode-igst', mode === 'igst');
  itemsTable.classList.toggle('mode-cgst', mode === 'cgst');
  totalsCell.classList.toggle('mode-igst', mode === 'igst');
  totalsCell.classList.toggle('mode-cgst', mode === 'cgst');

  document.getElementById('igstLabel').textContent = `Integrated Tax (IGST ${totalRate}%):`;
  document.getElementById('cgstLabel').textContent = `Central Tax (CGST ${halfRate}%):`;
  document.getElementById('sgstLabel').textContent = `State Tax (SGST ${halfRate}%):`;

  let grandTaxable = 0, grandTax = 0;

  [...itemsBody.children].forEach((tr, i) => {
    tr.querySelector('.row-sno').textContent = i + 1;
    const idx = parseInt(tr.querySelector('.product-select').value, 10);
    const p = PRODUCTS[idx];
    const qty = parseFloat(tr.querySelector('.qty-input').value) || 0;
    const taxable = qty * p.rate;
    const tax = taxable * (totalRate / 100);

    tr.querySelector('.qty-print').textContent = qty;
    tr.querySelector('.col-taxable').textContent = money(taxable);
    tr.querySelector('.col-igst').textContent = money(tax);
    tr.querySelector('.col-cgst').textContent = money(tax / 2);
    tr.querySelector('.col-sgst').textContent = money(tax / 2);

    grandTaxable += taxable;
    grandTax += tax;
  });

  const grandTotal = grandTaxable + grandTax;

  document.getElementById('totalTaxable').textContent = money(grandTaxable);
  document.getElementById('totalIGST').textContent = money(grandTax);
  document.getElementById('totalCGST').textContent = money(grandTax / 2);
  document.getElementById('totalSGST').textContent = money(grandTax / 2);
  document.getElementById('grandTotal').textContent = money(grandTotal);

  document.getElementById('amountWords').textContent = amountInWords(grandTotal);
}

// ---------- Number to words (Indian numbering system) ----------
function amountInWords(amount){
  amount = Math.round(amount * 100) / 100;
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  if (rupees === 0 && paise === 0) return 'Zero Rupees Only.';

  let words = 'Rupees ' + numToWordsIndian(rupees);
  if (paise > 0){
    words += ' and ' + numToWordsIndian(paise) + ' Paise';
  }
  return words + ' Only.';
}

function numToWordsIndian(num){
  if (num === 0) return 'Zero';
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
    'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

  function twoDigits(n){
    if (n < 20) return ones[n];
    const t = Math.floor(n/10), o = n%10;
    return tens[t] + (o ? ' ' + ones[o] : '');
  }
  function threeDigits(n){
    const h = Math.floor(n/100), rest = n%100;
    let s = '';
    if (h) s += ones[h] + ' Hundred' + (rest ? ' ' : '');
    if (rest) s += twoDigits(rest);
    return s;
  }

  const crore = Math.floor(num / 10000000); num %= 10000000;
  const lakh  = Math.floor(num / 100000);   num %= 100000;
  const thousand = Math.floor(num / 1000);  num %= 1000;
  const hundred = num;

  let parts = [];
  if (crore) parts.push(threeDigits(crore) + ' Crore');
  if (lakh) parts.push(threeDigits(lakh) + ' Lakh');
  if (thousand) parts.push(threeDigits(thousand) + ' Thousand');
  if (hundred) parts.push(threeDigits(hundred));

  return parts.join(' ').replace(/\s+/g,' ').trim();
}

// ---------- Event wiring ----------
itemsBody.addEventListener('change', (e) => {
  if (e.target.classList.contains('product-select')){
    fillRowStatic(e.target.closest('tr'));
  }
  recalcAll();
});
itemsBody.addEventListener('input', (e) => {
  if (e.target.classList.contains('qty-input')) recalcAll();
});
itemsBody.addEventListener('click', (e) => {
  if (e.target.classList.contains('row-del')){
    e.target.closest('tr').remove();
    recalcAll();
  }
});

document.getElementById('btnAddRow').addEventListener('click', () => addRow(0, ''));
document.getElementById('btnAddRow2').addEventListener('click', () => addRow(0, ''));
document.getElementById('btnPrint').addEventListener('click', () => window.print());
document.getElementById('btnReset').addEventListener('click', () => {
  if (confirm('Clear all product rows and reset invoice fields?')){
    itemsBody.innerHTML = '';
    rowCounter = 0;
    addRow(0, '');
    document.getElementById('buyerName').value = '';
    document.getElementById('buyerAddress').value = '';
    document.getElementById('buyerDL').value = '';
    document.getElementById('buyerPAN').value = '';
    document.getElementById('buyerState').value = '';
    document.getElementById('buyerStateCode').value = '';
    document.getElementById('invoiceNo').value = '';
    document.getElementById('placeOfSupply').value = '';
    document.getElementById('placeOfSupplyCode').value = '';
    setToday();
    recalcAll();
  }
});
supplyType.addEventListener('change', recalcAll);
taxRateInput.addEventListener('input', recalcAll);

function setToday(){
  const d = new Date();
  document.getElementById('invoiceDate').value = d.toISOString().slice(0,10);
}

// ---------- Init ----------
setToday();
addRow(0, 276);
recalcAll();
