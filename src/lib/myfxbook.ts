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
<script type="text/javascript">showOutlookWidget()</script>`;

/**
 * Live spread comparison. Myfxbook generates this code for a chosen list of
 * brokers at https://www.myfxbook.com/get-widget/18/broker_widgets, so it is
 * pasted here as generated rather than written by hand. Until it is, /spreads
 * leaves the section out.
 */
export const MYFXBOOK_SPREADS: string | null = null;
