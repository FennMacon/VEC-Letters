from pathlib import Path
import shutil,os,re,json,subprocess,concurrent.futures
root=Path(__file__).resolve().parent.parent
backup=root/'backups'/'original-2026-10-19'
if backup.exists():
 raise SystemExit('Backup exists; refusing to overwrite it.')
backup.mkdir(parents=True)
for p in root.iterdir():
 if p.name in {'.git','backups','scripts'}: continue
 if p.is_dir(): shutil.copytree(p,backup/p.name,copy_function=os.link if p.name in {'letters','thumbs'} else shutil.copy2)
 else: shutil.copy2(p,backup/p.name)
print('Original site saved:',backup,flush=True)
dates=re.findall(r'<h3>(.*?)</h3>',(root/'index.html').read_text())
letters=[]
jobs=[]
for n in range(1,21):
 images=[]
 for src in re.findall(r'<img[^>]+src="([^"]+)"',(root/f'{n}.html').read_text()):
  original=src.removeprefix('./'); stem=Path(src).stem
  preview=f'previews/{n}/{stem}.jpg'
  label={'F':'Envelope front','R':'Envelope back','PanoF':'Unfolded front','PanoB':'Unfolded back'}.get(stem,'Page '+stem if stem.isdigit() else stem)
  images.append({'src':original,'preview':preview,'label':label})
  jobs.append((original,preview))
 letters.append({'id':n,'date':dates[n-1],'images':images})
(root/'js'/'gallery-data.js').write_text('window.VEC_LETTERS = '+json.dumps(letters,indent=2)+';\n')
def resize(job):
 src,dest=job;target=root/dest;target.parent.mkdir(parents=True,exist_ok=True)
 subprocess.run(['sips','-Z','1400','-s','formatOptions','72',str(root/src),'--out',str(target)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for i,_ in enumerate(pool.map(resize,jobs),1):
  if i%20==0:print(f'Prepared {i}/{len(jobs)} previews',flush=True)
print('All previews ready.',flush=True)
