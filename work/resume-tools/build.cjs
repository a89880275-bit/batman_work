// Run from any working directory: node resume-tools/build.cjs <restored-project-root>
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(process.argv[2]||path.join(__dirname,'..')),source=path.join(root,'work/sites-oncare'),out=path.join(root,'outputs/hospital-helpdesk');
fs.mkdirSync(out,{recursive:true});
for(const item of fs.readdirSync(source,{withFileTypes:true})){if(['.git','.openai','dist'].includes(item.name))continue;fs.cpSync(path.join(source,item.name),path.join(out,item.name),{recursive:true});}
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+fs.readFileSync(path.join(source,'style.css'),'utf8')+'</style>');html=html.replace(/<script src="([^"/]+\.js)"><\/script>/g,(_,file)=>'<script>'+fs.readFileSync(path.join(source,file),'utf8')+'</script>');if(/<script src=|<link rel="stylesheet"/.test(html))throw Error('Unbundled reference');
fs.mkdirSync(path.join(source,'dist'),{recursive:true});fs.writeFileSync(path.join(source,'dist/index.html'),html);fs.writeFileSync(path.join(root,'outputs/온케어_화면시연.html'),html);console.log('Built complete latest source:',Buffer.byteLength(html),'bytes');

fs.cpSync(path.join(source,'assets'),path.join(source,'dist/assets'),{recursive:true});

const web=path.join(root,'outputs/web'),oncare=path.join(web,'ichacare911');
fs.mkdirSync(oncare,{recursive:true});
fs.writeFileSync(path.join(oncare,'index.html'),html);
fs.cpSync(path.join(source,'assets'),path.join(oncare,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'work/portal/index.html'),path.join(web,'index.html'));
