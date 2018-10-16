import pandas as pd
import numpy as np

input_file = r'C:\Users\localadmin\PycharmProjects\swathLib\GAS1N40GS.txt_library_oxoall_allRT_10T2min75p100processed - Ions.txt'
output_file = r'C:\Users\localadmin\PycharmProjects\swathLib\GAS1N40GS.txt_library_oxoall_allRT_10T2min75p100processed - Ions.normalized.txt'
replicate_avg_file = r'C:\Users\localadmin\PycharmProjects\swathLib\GAS1N40GS.txt_library_oxoall_allRT_10T2min75p100processed - Ions.rep_avg.txt'
replicate = 3

replicate_avg = []
df = pd.read_csv(input_file, sep='\t')
df['RT'].fillna(-1, inplace=True)
column_n = len(df.columns)
for g, d in df.groupby([
    'Protein',
    'Peptide',
    'Precursor MZ',
    'Precursor Charge',
    'RT'
]):
    for i in range(9, column_n):
        total_oxoniome = d[df.columns[i]].sum()
        for ind, r in d.iterrows():
            df.at[ind, df.columns[i]] = r[df.columns[i]]/total_oxoniome

df['RT'].replace(-1, np.NaN, inplace=True)
df.to_csv(output_file, sep='\t', index=False)
if replicate > 0:
    for i, r in df.iterrows():
        new_r = r[r.index[0:9]]
        for ind in range(9, column_n, replicate):
            a = r[r.index[ind:ind+replicate]]
            new_r[r.index[ind]] = a.mean()
        replicate_avg.append(new_r)
if replicate_avg:
    s = pd.DataFrame(replicate_avg)
    s.to_csv(replicate_avg_file, sep='\t', index=False)
