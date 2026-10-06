import re,json,glob
h=open('index.html').read()
h=h.replace('<link rel="stylesheet" href="css/style.css">','<style>'+open('css/style.css').read()+'</style>')
data={f:json.load(open(f)) for f in glob.glob('data/**/*.json',recursive=True)}
h=re.sub(r'<script src="(.*?)"></script>',lambda m:'<script>'+open(m.group(1)).read()+'</script>',h)
h=h.replace('<script>','<script>window.__ARCHIVE_DATA__='+json.dumps(data)+';</script><script>',1)
import base64,os
for f in glob.glob('assets/ui/*.*'):
    if f.endswith('.gitkeep'):continue
    uri='data:image/%s;base64,'%('jpeg' if f.endswith('jpg') else 'png')+base64.b64encode(open(f,'rb').read()).decode()
    h=h.replace('../'+f,uri).replace(f,uri)
open('preview.html','w').write(h)
