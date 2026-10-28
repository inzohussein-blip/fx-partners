/**
 * Myfxbook's free widgets. Terms: the "Powered by Myfxbook.com" link must stay
 * with the widget, and the data is shown as-is, never copied or stored.
 *
 * Myfxbook's scripts write straight into the document they run in, which in a
 * React page would wipe the page. So each snippet runs inside its own sandboxed
 * iframe (see MyfxbookWidget) and talks to nothing on this site.
 */

/** Community outlook: what share of Myfxbook's live accounts is long or short. */
export const MYFXBOOK_OUTLOOK = `
<div><script class="powered" type="text/javascript" src="https://widgets.myfxbook.com/scripts/fxOutlook.js?type=1&symbols=,1,3,11,29"></script></div>
<div style="font-size:10px"><a href="https://www.myfxbook.com" class="myfxbookLink" target="_blank" rel="noopener">Powered by Myfxbook.com</a></div>
<script type="text/javascript">if (window.showOutlookWidget) showOutlookWidget()</script>`;

/**
 * Live spread comparison, as generated at
 * https://www.myfxbook.com/get-widget/18/broker_widgets. It is a plain
 * cross-origin iframe, so it is embedded directly (MyfxbookFrame); to change
 * the brokers or symbols, regenerate it there and replace this URL.
 */
export const MYFXBOOK_SPREADS_SRC =
  "https://widget.mfbcdn.net/widget/broker-spreads.html?symbols=AUDCAD,AUDCHF,AUDJPY,AUDNZD,AUDSGD,AUDUSD,BTCGBP,BTCUSD,CADCHF,CADJPY,CADSGD,CHFJPY,CHFSGD,EURAUD,EURCAD,EURCHF,EURCZK,EURDKK,EURGBP,EURHUF,EURJPY,EURNOK,EURNZD,EURPLN,EURSEK,EURSGD,EURTRY,EURUSD,EURZAR,GBPAUD,GBPCAD,GBPCHF,GBPJPY,GBPNOK,GBPNZD,GBPSGD,GBPUSD,MXNJPY,NOKJPY,NOKSEK,NZDCAD,NZDCHF,NZDJPY,NZDUSD,SGDJPY,TRYJPY,USDCAD,USDCHF,USDCNY,USDCZK,USDDKK,USDHKD,USDHUF,USDINR,USDJPY,USDMXN,USDNOK,USDPLN,USDSAR,USDSEK,USDSGD,USDTHB,USDTRY,USDTWD,USDZAR,XAGUSD,XAUAUD,XAUEUR,XAUUSD,ZARJPY&mt4Servers=10018,10024,1011,10281,10309,10365,1038,1055,1065,10687,10708,1124,11247,1131,11407,11430,11475,11480,11720,12101,12115,1212,12129,12269,12345,1241,12422,1271,12872,12908,12920,12960,13283,13350,1420,1437,14398,14477,1453,14635,14636,14657,14755,1486,14868,14888,15050,15089,15148,15159,15170,15176,15267,15310,15316,15355,15359,15476,15486,15546,15559,15560,15603,15651,15774,15788,15794,15830,15872,15875,1589,15945,16023,1606,16088,16138,16140,16150,16167,16283,16310,16313,16351,16352,16358,16359,16450,16491,16526,16534,16535,16646,16649,16650,16657,16673,1673,16731,16766,16792,16799,16807,16862,16865,16870,16891,169,16906,16930,16944,17102,1736,1768,187,1890,1946,2015,2057,2061,2185,2228,229,2398,2449,2461,2468,2512,2515,2545,2559,2627,2641,2659,27,2719,272,2768,2773,2804,2824,2914,2945,3036,3131,3228,3234,3278,3302,332,3359,3381,3420,3451,3473,3505,3512,3622,3819,3984,4214,4262,4342,4346,4417,4552,4575,4582,4730,4777,4778,4830,4887,4904,492,4928,4931,5000,5050,5081,5116,5118,5119,5153,5168,5191,5204,5569,5895,5909,6015,6049,6052,620,6211,6217,6233,6265,6391,6410,6502,6508,6529,6627,6746,716,727,7467,757,790,792,808,8146,8314,8923,9245,9280,930,9301&includeCommissions=false&promoteBroker=0";
