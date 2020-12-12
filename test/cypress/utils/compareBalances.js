const castBalanceStringToNumber = number => parseFloat(number.replace(/,/g, ''));

export default function compareBalances(balanceBeforeString, balanceAfterString, cost) {
  const balanceBefore = castBalanceStringToNumber(balanceBeforeString.replace(' F39', ''));
  const balanceAfter = castBalanceStringToNumber(balanceAfterString.replace(' F39', ''));
  expect(balanceAfter - parseFloat(balanceBefore - cost)).to.lt(0.1);
}
