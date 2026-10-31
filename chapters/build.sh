#!/bin/bash
# Rebuild combined Markdown, then DOCX and PDF with rendered diagrams.
set -e
cd "$(dirname "$0")"
{ cat chapter2.md; printf '\n\n'; cat chapter3.md; printf '\n\n'; cat references.md; } > Chapter2_Chapter3.md
python3 - <<'PY'
import re
s=open('Chapter2_Chapter3.md').read()
names=iter(['uc_user','uc_lawyer','uc_admin','sd_login','sd_case','sd_rag','sd_docs','sd_consult','sd_lawyer','sd_verify','sd_ingest','domain_model','nav_map'])
s=re.sub(r'```mermaid\n.*?```',lambda m:f'![](diagrams/{next(names)}.png){{width=100%}}',s,flags=re.S)
s=re.sub(r'!\[\]\((\.\./design/prototype/screens/[^)]*)\)',lambda m:'![]('+m.group(1).replace('../design/prototype/','')+'){width=100%}',s)
open('_rendered.md','w').write(s)
PY
pandoc _meta.yaml _rendered.md -o Chapter2_Chapter3.docx --toc
pandoc _meta.yaml _rendered.md -o Chapter2_Chapter3.pdf --pdf-engine=pdflatex --toc -V fontfamily=mathptmx -V colorlinks=true >/dev/null 2>&1
rm -f _rendered.md
