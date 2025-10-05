export interface RuleResult {
  rule: string;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
  explanation?: string; // P1: Human-readable explanations
}

export const checkTotalsBalance = (data: any[]): RuleResult => {
  for (const row of data) {
    const totalExclVat = parseFloat(row.total_excl_vat || row.totalExclVat || 0);
    const vatAmount = parseFloat(row.vat_amount || row.vatAmount || 0);
    const totalInclVat = parseFloat(row.total_incl_vat || row.totalInclVat || 0);

    if (totalExclVat && vatAmount && totalInclVat) {
      const calculated = totalExclVat + vatAmount;
      if (Math.abs(calculated - totalInclVat) > 0.01) {
        return {
          rule: 'TOTALS_BALANCE',
          ok: false,
          expected: calculated,
          got: totalInclVat,
          explanation: 'Invoice totals do not balance. Ensure total_excl_vat + vat_amount = total_incl_vat (±0.01)'
        };
      }
    }
  }
  return { 
    rule: 'TOTALS_BALANCE', 
    ok: true,
    explanation: 'All invoice totals are correctly balanced'
  };
};

export const checkLineMath = (data: any[]): RuleResult => {
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const qty = parseFloat(row.qty || row.quantity || 0);
    const unitPrice = parseFloat(row.unit_price || row.unitPrice || 0);
    const lineTotal = parseFloat(row.line_total || row.lineTotal || 0);

    if (qty && unitPrice && lineTotal) {
      const calculated = qty * unitPrice;
      if (Math.abs(calculated - lineTotal) > 0.01) {
        return {
          rule: 'LINE_MATH',
          ok: false,
          exampleLine: i + 1,
          expected: calculated,
          got: lineTotal,
          explanation: `Line ${i + 1}: Quantity × Unit Price (${qty} × ${unitPrice} = ${calculated}) should equal Line Total (${lineTotal})`
        };
      }
    }
  }
  return { 
    rule: 'LINE_MATH', 
    ok: true,
    explanation: 'All line item calculations are correct'
  };
};

export const checkDateISO = (data: any[]): RuleResult => {
  for (const row of data) {
    const date = row.issue_date || row.issueDate || row.date;
    if (date && typeof date === 'string') {
      const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!isoRegex.test(date)) {
        return {
          rule: 'DATE_ISO',
          ok: false,
          value: date,
          explanation: `Date "${date}" should be in YYYY-MM-DD format (e.g., 2025-01-31)`
        };
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return {
          rule: 'DATE_ISO',
          ok: false,
          value: date,
          explanation: `Date "${date}" is not a valid date`
        };
      }
    }
  }
  return { 
    rule: 'DATE_ISO', 
    ok: true,
    explanation: 'All dates are in valid ISO format (YYYY-MM-DD)'
  };
};

export const checkCurrencyAllowed = (data: any[]): RuleResult => {
  const allowedCurrencies = ['AED', 'SAR', 'MYR', 'USD'];
  
  for (const row of data) {
    const currency = row.currency;
    if (currency && typeof currency === 'string') {
      if (!allowedCurrencies.includes(currency.toUpperCase())) {
        return {
          rule: 'CURRENCY_ALLOWED',
          ok: false,
          value: currency,
          explanation: `Currency "${currency}" is not allowed. Supported currencies: ${allowedCurrencies.join(', ')}`
        };
      }
    }
  }
  return { 
    rule: 'CURRENCY_ALLOWED', 
    ok: true,
    explanation: 'All currencies are supported (AED, SAR, MYR, USD)'
  };
};

export const checkTRNPresent = (data: any[]): RuleResult => {
  for (const row of data) {
    const buyerTRN = row.buyer_trn || row.buyerTrn || row.buyer_tax_id;
    const sellerTRN = row.seller_trn || row.sellerTrn || row.seller_tax_id;

    const isValid = !!(buyerTRN && sellerTRN && 
                      buyerTRN.toString().trim() !== '' && 
                      sellerTRN.toString().trim() !== '');

    if (!isValid) {
      return { 
        rule: 'TRN_PRESENT', 
        ok: false,
        explanation: 'Missing Tax Registration Numbers (TRN) for buyer or seller. Both are required.'
      };
    }
  }
  return { 
    rule: 'TRN_PRESENT', 
    ok: true,
    explanation: 'TRN numbers present for all buyers and sellers'
  };
};

// P2: Country-specific rules
export const checkCountrySpecificRules = (data: any[], country: string): RuleResult[] => {
  const results: RuleResult[] = [];
  
  if (country === 'UAE') {
    // UAE-specific: TRN must be 15 digits
    for (const row of data) {
      const buyerTRN = row.buyer_trn || row.buyerTrn;
      const sellerTRN = row.seller_trn || row.sellerTrn;
      
      if (buyerTRN && buyerTRN.toString().length !== 15) {
        results.push({
          rule: 'UAE_TRN_LENGTH',
          ok: false,
          value: `Buyer TRN should be 15 digits, got ${buyerTRN.toString().length}`,
          explanation: 'UAE TRN must be exactly 15 digits long'
        });
      }
      
      if (sellerTRN && sellerTRN.toString().length !== 15) {
        results.push({
          rule: 'UAE_TRN_LENGTH', 
          ok: false,
          value: `Seller TRN should be 15 digits, got ${sellerTRN.toString().length}`,
          explanation: 'UAE TRN must be exactly 15 digits long'
        });
      }
    }
  }
  
  if (country === 'KSA') {
    // KSA-specific: VAT rate should be 15%
    for (const row of data) {
      const totalExcl = parseFloat(row.total_excl_vat || 0);
      const vatAmount = parseFloat(row.vat_amount || 0);
      
      if (totalExcl > 0 && vatAmount > 0) {
        const calculatedRate = (vatAmount / totalExcl) * 100;
        if (Math.abs(calculatedRate - 15) > 0.1) {
          results.push({
            rule: 'KSA_VAT_RATE',
            ok: false,
            value: `VAT rate should be 15%, calculated ${calculatedRate.toFixed(2)}%`,
            explanation: 'KSA requires 15% VAT rate on all invoices'
          });
        }
      }
    }
  }
  
  if (country === 'MY') {
    // Malaysia-specific: GST registration number format
    for (const row of data) {
      const buyerTRN = row.buyer_trn || row.buyerTrn;
      const sellerTRN = row.seller_trn || row.sellerTrn;
      
      const gstRegex = /^\d{12}$/;
      if (buyerTRN && !gstRegex.test(buyerTRN.toString())) {
        results.push({
          rule: 'MY_GST_FORMAT',
          ok: false,
          value: buyerTRN.toString(),
          explanation: 'Malaysia GST number should be 12 digits'
        });
      }
      
      if (sellerTRN && !gstRegex.test(sellerTRN.toString())) {
        results.push({
          rule: 'MY_GST_FORMAT',
          ok: false,
          value: sellerTRN.toString(),
          explanation: 'Malaysia GST number should be 12 digits'
        });
      }
    }
  }
  
  return results;
};

export const runAllRules = (data: any[], country: string = 'UAE'): RuleResult[] => {
  const standardRules = [
    checkTotalsBalance(data),
    checkLineMath(data),
    checkDateISO(data),
    checkCurrencyAllowed(data),
    checkTRNPresent(data)
  ];
  
  const countryRules = checkCountrySpecificRules(data, country);
  
  return [...standardRules, ...countryRules];
};

// P1: Generate human-readable explanations
export const generateRuleExplanations = (ruleFindings: RuleResult[]): string[] => {
  const explanations: string[] = [];
  
  ruleFindings.forEach(rule => {
    if (!rule.ok && rule.explanation) {
      explanations.push(rule.explanation);
    }
  });
  
  return explanations;
};