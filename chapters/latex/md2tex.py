"""Convert the Chapter 2/3 Markdown sources into LaTeX in the FYP report style.

Usage: python3 md2tex.py <chapter.md> <out.tex> [--refs]
"""
import re
import sys

MERMAID_NAMES = iter(['uc_user', 'uc_lawyer', 'uc_admin', 'sd_login', 'sd_case', 'sd_rag', 'sd_docs',
                      'sd_consult', 'sd_lawyer', 'sd_verify', 'sd_ingest', 'domain_model', 'nav_map'])
TEXTWIDTH_CM = 16.0


def esc(t):
    """Escape LaTeX specials, keeping URLs intact via placeholders."""
    urls = []

    def keep(m):
        urls.append(m.group(0))
        return f'@@URL{len(urls) - 1}@@'
    t = re.sub(r'https?://\S+', keep, t)
    t = t.replace('\\', r'\textbackslash{}')
    for a, b in [('&', r'\&'), ('%', r'\%'), ('$', r'\$'), ('#', r'\#'), ('_', r'\_'),
                 ('{', r'\{'), ('}', r'\}'), ('~', r'\textasciitilde{}'), ('^', r'\textasciicircum{}')]:
        t = t.replace(a, b)
    t = t.replace(r'\textbackslash\{\}', r'\textbackslash{}')
    for i, u in enumerate(urls):
        t = t.replace(f'@@URL{i}@@', r'\url{' + u + '}')
    return t


def inline(t):
    codes = []

    def keepcode(m):
        c = esc(m.group(1)).replace('<<', '<{}<').replace('>>', '>{}>')
        codes.append(r'\texttt{' + c + '}')
        return f'@@CODE{len(codes) - 1}@@'
    t = re.sub(r'`([^`]+)`', keepcode, t)
    t = esc(t)
    t = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'\\emph{\1}', t)
    t = re.sub(r'"([^"]*)"', r"``\1''", t)
    # citations [n], [n]-[m]
    t = re.sub(r'\[(\d+)\]-\[(\d+)\]', lambda m: r'\cite{r' + m.group(1) + r'}--\cite{r' + m.group(2) + '}', t)
    t = re.sub(r'\[(\d+)\]', lambda m: r'\cite{r' + m.group(1) + '}', t)
    # figure/table cross references
    t = re.sub(r'\b(Figures?|Tables?) (\d)\.(\d+)', lambda m: m.group(1) + r'~\ref{' +
               ('fig' if m.group(1).startswith('F') else 'tab') + f':{m.group(2)}.{m.group(3)}' + '}', t)
    t = re.sub(r'(\\ref\{(fig|tab):\d\.\d+\}) (to|and) (\d)\.(\d+)',
               lambda m: m.group(1) + ' ' + m.group(3) + r'~\ref{' + m.group(2) + f':{m.group(4)}.{m.group(5)}' + '}', t)
    for i, c in enumerate(codes):
        t = t.replace(f'@@CODE{i}@@', c)
    return t


def table(rows, sep, caption=None, label=None):
    widths = [len(x) for x in sep.strip().strip('|').split('|')]
    ncol = len(widths)
    avail = TEXTWIDTH_CM - 0.46 * ncol - 0.15
    raw = [avail * w / sum(widths) for w in widths]
    minw = 1.7
    short = [max(minw, x) for x in raw]
    extra = sum(short) - avail
    big = [i for i, x in enumerate(raw) if x > minw]
    tot_big = sum(raw[i] for i in big)
    final = [short[i] - (extra * raw[i] / tot_big if i in big else 0) for i in range(ncol)]
    cols = '|' + '|'.join('L{%.2fcm}' % x for x in final) + '|'
    cells = [[c.strip() for c in r.strip().strip('|').split('|')] for r in rows]
    out = [r'\begin{longtable}{' + cols + '}']
    if caption:
        out.append(r'\caption{' + inline(caption) + '}' + (r'\label{' + label + '}' if label else '') + r'\\')
    head = r'\hline\headrow ' + ' & '.join(r'\thd{' + inline(c) + '}' for c in cells[0]) + r' \\ \hline'
    out += [head, r'\endfirsthead', head, r'\endhead', r'\hline\endlastfoot']
    for r in cells[1:]:
        r = (r + [''] * ncol)[:ncol]
        nonempty = [c for c in r if c]
        if len(nonempty) == 1 and nonempty[0].startswith('**') and r[0] == '':
            out.append(r'\multicolumn{%d}{|l|}{\cellcolor{rowtint}%s} \\ \hline' % (ncol, inline(nonempty[0])))
        else:
            out.append(' & '.join(inline(c) for c in r) + r' \\ \hline')
    if out[-1].endswith(r'\\ \hline'):
        out[-1] = out[-1][:-len(r'\\ \hline')] + r'\\'
    out.append(r'\end{longtable}')
    if not caption and len(cells) <= 10:
        body = [x for x in out if not x.startswith((r'\begin{longtable}', r'\endfirsthead', r'\endhead', r'\end{longtable}', r'\hline\endlastfoot'))]
        # drop the duplicated head line kept for \endhead
        body = body[:1] + body[2:]
        body[-1] = body[-1] + r' \hline'
        return (r'\begin{center}' '\n' r'\begin{tabular}{' + cols + '}\n' + '\n'.join(body) +
                '\n' r'\end{tabular}' '\n' r'\end{center}')
    return '\n'.join(out)


def figure(path, caption, label, name=None):
    if name == 'domain_model':
        return (r'\begin{landscape}' '\n' r'\begin{figure}[p]\centering' '\n'
                r'\includegraphics[width=24.5cm,height=14.8cm,keepaspectratio]{' + path + '}\n'
                r'\caption{' + inline(caption) + r'}\label{' + label + '}\n'
                r'\end{figure}' '\n' r'\end{landscape}')
    return (r'\begin{figure}[H]\centering' '\n'
            r'\includegraphics[width=\textwidth,height=0.62\textheight,keepaspectratio]{' + path + '}\n'
            r'\caption{' + inline(caption) + r'}\label{' + label + '}\n' r'\end{figure}')


def convert(md):
    lines = md.split('\n')
    out = []
    i = 0
    pending = None  # (kind, caption, label)
    while i < len(lines):
        l = lines[i]
        s = l.strip()
        if not s:
            i += 1
            continue
        m = re.match(r'^(#{1,4}) (.*)$', s)
        if m:
            level, text = len(m.group(1)), m.group(2)
            if level == 1:
                cm = re.match(r'Chapter (\d+): (.*)', text)
                out.append(r'\chapter{' + inline(cm.group(2)) + '}\\label{ch:' + cm.group(1) + '}')
            else:
                text = re.sub(r'^\d+(\.\d+)+ ', '', text)
                cmd = {2: 'section', 3: 'subsection', 4: 'subsubsection'}[level]
                prev = out[-1] if out else ''
                after_heading = re.search(r'\\(chapter|section|subsection)\{[^\n]*$', prev) is not None
                guard = '' if (r'\end{longtable}' in prev or after_heading) else r'\needspace{12\baselineskip}' + '\n'
                out.append(guard + '\\' + cmd + '{' + inline(text) + '}')
            i += 1
            continue
        m = re.match(r'^\*\*(Figure|Table) (\d)\.(\d+): (.*)\*\*$', s)
        if m:
            kind = m.group(1)
            pending = (kind, m.group(4), ('fig' if kind == 'Figure' else 'tab') + f':{m.group(2)}.{m.group(3)}')
            i += 1
            continue
        if s.startswith('```mermaid'):
            j = i + 1
            while not lines[j].startswith('```'):
                j += 1
            name = next(MERMAID_NAMES)
            src = '\n'.join('% ' + x for x in lines[i + 1:j])
            cap, lab = (pending[1], pending[2]) if pending else (name, 'fig:' + name)
            out.append('% Mermaid source:\n' + src + '\n' + figure('figures/' + name + '.png', cap, lab, name))
            pending = None
            i = j + 1
            continue
        m = re.match(r'^!\[[^\]]*\]\(([^)]*)\)', s)
        if m:
            path = 'figures/screens/' + m.group(1).split('/')[-1]
            cap, lab = (pending[1], pending[2]) if pending else ('', '')
            out.append(figure(path, cap, lab))
            pending = None
            i += 1
            continue
        if s.startswith('|'):
            rows = []
            sep = lines[i + 1]
            rows.append(lines[i])
            j = i + 2
            while j < len(lines) and lines[j].startswith('|'):
                rows.append(lines[j])
                j += 1
            if pending and pending[0] == 'Table':
                out.append(table(rows, sep, pending[1], pending[2]))
                pending = None
            else:
                out.append(table(rows, sep))
            i = j
            continue
        if re.match(r'^\d+\. ', s) or s.startswith('- '):
            env = 'enumerate' if re.match(r'^\d+\. ', s) else 'itemize'
            items = []
            while i < len(lines) and (re.match(r'^\d+\. ', lines[i].strip()) or lines[i].strip().startswith('- ')):
                items.append(re.sub(r'^(\d+\. |- )', '', lines[i].strip()))
                i += 1
            out.append('\\begin{' + env + '}\n' + '\n'.join(r'  \item ' + inline(x) for x in items) +
                       '\n\\end{' + env + '}')
            continue
        # paragraph
        para = [s]
        i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'^(#|\||```|!\[|\d+\. |- |\*\*(Figure|Table) )',
                                                                   lines[i].strip()):
            para.append(lines[i].strip())
            i += 1
        out.append(inline(' '.join(para)))
    return '\n\n'.join(out) + '\n'


def convert_refs(md):
    items = re.findall(r'^\[(\d+)\] (.*)$', md, flags=re.M)
    out = [r'\begin{thebibliography}{99}', r'\addcontentsline{toc}{chapter}{References}']
    for n, text in items:
        out.append(r'\bibitem{r' + n + '} ' + inline(text).replace(r'\cite{', r'\cite{'))
    out.append(r'\end{thebibliography}')
    return '\n\n'.join(out) + '\n'


if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    md = open(src, encoding='utf-8').read()
    if '--refs' in sys.argv:
        tex = convert_refs(md)
    else:
        if '--ch3' in sys.argv:  # chapter 3 continues the mermaid sequence; chapter 2 has none
            pass
        tex = convert(md)
    open(dst, 'w', encoding='utf-8').write(tex)
