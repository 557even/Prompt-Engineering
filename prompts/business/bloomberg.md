+===================================================================================================================+
|   B L O O M B E R G   T E R M I N A L   {{ version }}  {{ timestamp }}                                 |
+===================================================================================================================+

    STATUS:
      Health        : {{ status.health }}
      Tasks         : {{ status.tasks }}
      Objective     : {{ status.objective }}
      Results       : {{ status.results }}

    SYSTEM VARIABLES:
      User          : {{ system.user }}
      Session ID    : {{ system.session_id }}
      Uptime        : {{ system.uptime }}
      Mode          : {{ system.mode }}
      Prompt Mode   : {{ system.prompt_mode }}
      Learning Rate : {{ system.learning_rate }}
      Loop Count    : {{ system.loop_count }}

    MARKET SUMMARY
      Index                    Last      Net Chg  % Chg   Day High   Day Low   Volume
      --------------------------------------------------------------------------------
{% for i in indices %}
      {{ i.name | ljust(25) }}{{ i.last | format(',.2f') | rjust(9) }} {{ i.net_chg | sign('+.2f') }} {{ i.pct_chg | sign('.2%') }} {{ i.day_high | format(',.2f') }} {{ i.day_low | format(',.2f') }} {{ i.volume }}
{% endfor %}

    EQUITY PRICE MONITOR (U.S. EQUITIES)
      Ticker   Name                     Last    Net Chg  % Chg   Volume   Bid      Ask
      --------------------------------------------------------------------------------
{% for e in equities %}
      {{ e.ticker }} {{ e.name | ljust(25) }}{{ e.last | format(',.2f') }} {{ e.net_chg | sign('+,.2f') }} {{ e.pct_chg | sign('.2%') }} {{ e.volume }} {{ e.bid | format(',.2f') }} {{ e.ask | format(',.2f') }}
{% endfor %}

    FX & COMMODITY TICKERS
      Pair    Price    Net Chg  % Chg   Bid      Ask
      --------------------------------------------------------------------------------
{% for f in fx %}
      {{ f.pair }} {{ f.price }} {{ f.net_chg | sign('+,.4f') }} {{ f.pct_chg | sign('.2%') }} {{ f.bid }} {{ f.ask }}
{% endfor %}
{% for c in commodities %}
      {{ c.symbol }} {{ c.price }} {{ c.net_chg | sign('+,.2f') }} {{ c.pct_chg | sign('.2%') }} {{ c.volume }} {{ c.bid }} {{ c.ask }}
{% endfor %}

    NEWS HEADLINES (TOP {{ news|length }})
{% for n in news %}
      {{ loop.index }}. {{ n.title }}
         ({{ n.tags }})
{% endfor %}

 ---------------------------------------------------------------------------------------
 COMMAND LINE (type <GO> to execute, <HELP> for assistance)

   > [ticker] <FA> <GO>    - Financial Analysis
   > [ticker] <EQS> <GO>   - Equity Quick Search
   > [ticker] <GP> <GO>    - Graph Price
   > HELP <GO>            - Help Menu
   > EXIT <GO>            - Close Session

   > _
+-------------------------------------------------------------------------------------------------------------------+
