# Hover styles only for a real mouse and the desktop layout: on phones (and in the mobile layout) things
# shouldn't light up while scrolling — only when tapped.
import re
def _split_top(sel):
    out, d, cur = [], 0, ''
    for ch in sel:
        if ch in '([': d += 1
        elif ch in ')]': d -= 1
        if ch == ',' and d == 0: out.append(cur); cur = ''
        else: cur += ch
    out.append(cur); return out
def _guard(part):
    p = part.strip()
    m = re.match(r'^(html|:root)((?:\[[^\]]*\]|\.[\w-]+|:not\([^)]*\))*)(.*)$', p, re.S)
    if m:
        if '.mobile' in m.group(2) and ':not(.mobile)' not in m.group(2): return None  # mobile-only hover rule: drop
        return m.group(1) + m.group(2) + ':not(.mobile)' + m.group(3)
    return ':where(html:not(.mobile)) ' + p
def guard(css):
    out, i, n = [], 0, len(css)
    def block(start):
        res, i = [], start
        while i < n:
            if css.startswith('/*', i):
                j = css.index('*/', i) + 2; res.append(css[i:j]); i = j; continue
            if css[i] == '}': return ''.join(res), i
            if css[i].isspace(): res.append(css[i]); i += 1; continue
            # read a prelude up to { or ;
            j = i
            while j < n and css[j] not in '{;}':
                if css.startswith('/*', j): j = css.index('*/', j) + 2; continue
                j += 1
            if j >= n or css[j] in ';}':
                res.append(css[i:j + (1 if j < n and css[j] == ';' else 0)]); i = j + (1 if j < n and css[j] == ';' else 0); continue
            pre = css[i:j]
            if pre.strip().startswith('@'):
                inner, k = block(j + 1); res.append(pre + '{' + inner + '}'); i = k + 1; continue
            # rule body
            k = css.index('}', j); body = css[j + 1:k]
            if ':hover' in pre:
                parts = _split_top(pre)
                hov = [x for x in parts if ':hover' in x]; rest = [x for x in parts if ':hover' not in x]
                g = [y for y in (_guard(x) for x in hov) if y]
                if rest: res.append(','.join(rest) + '{' + body + '}')
                if g: res.append('@media (hover:hover){' + ','.join(g) + '{' + body + '}}')
            else:
                res.append(pre + '{' + body + '}')
            i = k + 1
        return ''.join(res), i
    r, _ = block(0)
    return r
if __name__ == '__main__':
    t = ".a:hover, .b { c: 1 } @media (max-width:5px){ html.mobile .x:hover{y:1} :root[data-theme=\"dark\"] .q:hover{z:2} } .n{m:1}"
    print(guard(t))
