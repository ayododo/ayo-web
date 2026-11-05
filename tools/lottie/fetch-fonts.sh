#!/bin/sh
# Static Figtree weights (400–800) from Google Fonts, used to outline text.
set -e
cd "$(dirname "$0")"
mkdir -p fonts
for pair in 400:_Xmz-HUzqDCFdgfMsYiV_F7wfS-Bs_d_QF5e 500:_Xmz-HUzqDCFdgfMsYiV_F7wfS-Bs_dNQF5e 600:_Xmz-HUzqDCFdgfMsYiV_F7wfS-Bs_ehR15e 700:_Xmz-HUzqDCFdgfMsYiV_F7wfS-Bs_eYR15e 800:_Xmz-HUzqDCFdgfMsYiV_F7wfS-Bs_f_R15e; do
  w=${pair%%:*}; id=${pair#*:}
  curl -sfL -o "fonts/$w.ttf" "https://fonts.gstatic.com/s/figtree/v9/$id.ttf"
done
echo "fonts ready"
