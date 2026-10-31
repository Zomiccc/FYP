# Chapters 2 and 3 (LaTeX)

- `main.tex` compiles the combined document: `pdflatex main.tex` (run three times for the contents and cross-references).
- `chapter2.tex`, `chapter3.tex`, `references.tex` are generated from `../chapter2.md`, `../chapter3.md` and `../references.md` by `md2tex.py`:
  `python3 md2tex.py ../chapter3.md chapter3.tex` (use `--refs` for the references file).
- The Mermaid source of each diagram is kept as a comment above its figure in `chapter3.tex`, and in `../diagrams/*.mmd`.
