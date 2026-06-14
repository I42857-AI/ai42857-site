import json, glob, os

base = r'D:\TRAE\XiangMu-KongJian\ZhiShi-TuPu\CaiPin-FenJing\.understand-anything'

with open(os.path.join(base, 'knowledge-graph.json'), 'r', encoding='utf-8') as f:
    main = json.load(f)

segments = glob.glob(os.path.join(base, 'knowledge-graph-*.json'))
print(f'Found {len(segments)} segment files')

merged_nodes = {n['id']: n for n in main.get('nodes', [])}
merged_edges = {}
for e in main.get('edges', []):
    key = e['source'] + '|' + e['target'] + '|' + e.get('type', '')
    merged_edges[key] = e
merged_layers = {l['id']: l for l in main.get('layers', [])}

for seg_path in segments:
    with open(seg_path, 'r', encoding='utf-8') as f:
        seg = json.load(f)
    for n in seg.get('nodes', []):
        merged_nodes[n['id']] = n
    for e in seg.get('edges', []):
        key = e['source'] + '|' + e['target'] + '|' + e.get('type', '')
        merged_edges[key] = e
    for l in seg.get('layers', []):
        merged_layers[l['id']] = l

result = {}
for key in ('version', 'project', 'tour', 'kind'):
    if key in main:
        result[key] = main[key]

result['nodes'] = list(merged_nodes.values())
result['edges'] = list(merged_edges.values())
result['layers'] = list(merged_layers.values())

output = os.path.join(base, 'knowledge-graph-merged.json')
with open(output, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

n_count = len(result['nodes'])
e_count = len(result['edges'])
l_count = len(result['layers'])
print(f'Merged: {n_count} nodes, {e_count} edges, {l_count} layers')
print(f'Output: {output}')
