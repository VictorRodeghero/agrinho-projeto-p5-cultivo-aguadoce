/*Submetido ao projeto Agrinho do Estado do Paraná, 2025
Programado, inteiramente, por Victor Rodeghero, utilizando da biblioteca p5.js, sem utilizar qualquer recurso de propriedade externa ou de Inteligencia Artificial
Colégio Estadual Cívico Militar Santa Tereza do Oeste
Santa Tereza do Oeste, 2025.*/


/*interface*/
let trocarf;
let tentard;
/**/

/*variáveis*/
var curx,cury;//posição do quadrado selecionado atualmente no mapa;

var oldx,oldy;//ultimas posições do quadrado selecionado.
var curaction=1;//ação atual selecionada a ser efetuada após o clique do cursor.
var mape=[];// mapa do jogo, em valores de 1 a 256, sendo cada valor uma altura.
var mapf=[];// mapa do jogo, descrevendo objetos.
var mapp=[];//mapa do jogo, descrevendo plantas
var mapfl=[];//mapa do jogo, descrevendo depressões.
const maps=80;//tamanho do mapa
const scl=0.05// quao liso, natural e menos fragmentado o mapa é gerado, sendo valores maiores mais quebrados e valores menores mais lisos.
const flc=120;//nivel da água, de 0 a 256
const sqrs=5;//tamanho de cada quadrado, em pixels.
const scrsx=400;//largura da tela em pixels
const scrsy=400;//altura da tela em pixels
const minwaterdist=20;//distância maxima da água até uma planta para que ela cresca. 
var obsc=40/maps;
var objetos=[
[0,0,10,0,0,1,0,10,10,1,10,10,9,10,1,10]//quadrado
];//vetores de objetos vetoriais;
var secs=0;//contador de segundos.
var ctool="plantar";//ação/ferramenta atual, em texto.
var mousestate=0;//estado do mouse, 1 é pressionado.
var points=0;//pontos por cada planta que cresce,descontados do tempo.
var finish=0;//caso for 1, fim de jogo.
function reset(){}//reseta o jogo, definida ao fim do código.
var tentativa=0;//quantia de tentativas, usada para gerar mapas diferentes.
var objective=3000;//objetivo de pontos, aumenta a cada vez que o jogador vence.
var difficulty=1;//incrementado cada vez que o jogador vence.


/*Funções*/

function cmap()//criar mapa usando perlin noise.
{
for(let y=0;y<maps;y++)//para cada posição y de um quadrado vazio,
{
for(let x=0;x<maps;x++)// e para cada posição x de um quadrado vazio:
  {
    let nv=noise(x*scl,y*scl);//calcular altura de quadrado
    let smv=30;//fator de arredondamento da altura, quanto maior, mais tons podem aparecer no mapa.
    let ci=round(nv*smv)/smv*256
    mape[y*maps+x]=ci;//imprimir o valor arredondado na memória do mapa.
    if(ci<flc)//se valor menor que nivel da água, então:
    {
    mapf[y*maps+x]=0;//cor do quadrado é azul.
    }
    else
    {
    mapf[y*maps+x]=1;//senão, cor do quadrado é marrom.      
    }
  }
}
  
}




function dm(ofx,ofy,sx,sy)//desenha uma parcela do mapa.
{
  
for(let y=ofy;y<(sy);y++)//para cada valor y do mapa,
{
for(let x=ofx;x<(sx);x++)// e para cada valor x do mapa:
  {
    strokeWeight(0);//quadrados sem bordas
    let ci=mape[y*maps+x];//altura de cada quadrado do mapa, de 1 a 256
    let c=color(ci,ci,ci);//cor cinza, para se, em algum caso, um quadrado não ser terra nem água.
    
    switch(mapf[y*maps+x]){
        case 0:
        c=color(0,0,ci);//quadrado é considerado água.
        break;
        case 1:
        c=color(ci/3,ci/3,ci/7);//quadrado é considerado terra fértil.
        break;
        case -1:
        c=color(ci*8/10,ci,ci*8/10);//quadrado é considerado planta morta.
        break;
           }
      
    if(mapf[y*maps+x]>1){
      let age=mapf[y*maps+x];
      let pico=800;
      let r,g,b;
      
      //ci*5/6 é o valor final do vermelho.
      r=map(age,0,40,0,ci*5/6,true);
      g=ci*3/4;
      b=0;
      c=color(r,g,b);
     
        }
    
    fill(c);
    rect(x*sqrs,y*sqrs,sqrs,sqrs);//imprimir quadrado.
    
    
  }
}
  
}


function dv(obj,x,y,c)//imprime um objeto vetorial
{
  for(let xi=0;xi<obj.length;xi+=4)
    {

    strokeWeight(1);
    stroke(c);
    line(obj[xi]*obsc+x,obj[xi+1]*obsc+y,obj[xi+2]*obsc+x,obj[xi+3]*obsc+y);
    
    }
}
function dcursor()//imprime o cursor.
{
let mx;
let my;
mx=round((mouseX-sqrs/2)/sqrs)*sqrs;//converte quadrado selecionado  para o tamanho do quadrado
my=round((mouseY-sqrs/2)/sqrs)*sqrs;

if(mx>400-sqrs/2||my>400-sqrs/2)return;

dv(objetos[0],mx,my,color(256,256,256,256));//imprime o cursor
}

function lowerpos(x,y)//abaixa uma posição do mapa e a torna vazia.
{
      if(mapf[y*maps+x]!=0)
      {
      mape[y*maps+x]=flc-20-round(random(1,2)*20);
      mapf[y*maps+x]=1;
      mapfl[mapfl.length]=y*maps+x;
      
      dm(x,y,x+1,y+1);
      }
}

function cleanpos(x,y)//abaixa uma posição do mapa e a torna vazia.
{
      if(mapf[y*maps+x]==-1)
      {
      mapf[y*maps+x]=1;
      dm(x,y,x+1,y+1);
      }
}
function lowerbulk(x,y,ex,ey)//abaixa o mapa da posição x,y até a ex,ey.
{
  for(let i=y;i<ey;i++)
  {
    for(let e=x;e<ex;e++)
    {
    lowerpos(e,i);
    }
  
  }

}

function cleanbulk(x,y,ex,ey)//limpa o mapa da posição x,y até a ex,ey.
{
  for(let i=y;i<ey;i++)
  {
    for(let e=x;e<ex;e++)
    {
    cleanpos(e,i);
    }
  
  }

}

function keyPressed()//reage ao estado atual das teclas 1,2 e 3.
{
if(key=="1")
{
curaction=1;
ctool="plantar";
}
if(key=="2")
{
curaction=2;
ctool="abrir água";
}
if(key=="3")
{
curaction=3;
ctool="limpar terra";
}
  
  
}

function mousecheck()//reage ao estado atual do mouse.
{
if(mousestate!=1)return;//não executa nada caso mouse não estiver pressionado.
  switch(curaction){
    case 1:
      if(waterdist(curx,cury,minwaterdist+20)>minwaterdist)return;//não permite o plantio longe da água.
    switch(mapf[cury*maps+curx])
      {
        case 1:
        mapf[cury*maps+curx]=2;//grava no mapa visivel um quadrado verde.
        mapp[mapp.length]=2;//grava o tipo da planta no mapa de plantas.
        mapp[mapp.length]=curx;
        mapp[mapp.length]=cury;//grava a posição desta planta, em x e y.
        break;
      }
      
      break;
      case 2:
      
      lowerbulk(curx-1,cury-1,curx+2,cury+2);//abaixa um quadrado 3x3 ao usar a ferramenta "abrir rio".
    
      break;
      case 3:
      
      cleanbulk(curx-4,cury-4,curx+4,cury+4);//limpa um quadrado 9x9 ao usar a ferramenta "limpar terra".
    
      break;
  }
}
function moused(){mousestate=1;}
function mouseu(){mousestate=0;}
document.addEventListener('mousedown',moused);
document.addEventListener('mouseup',mouseu);

function waterdist(x,y,r){//determina a distancia de um quadrado até a fonte de água mais próxima.
let sx=x-r;
let sy=y-r;
let lowdist=r*r;
for(let i=sx;i<x+r;i++)
{
  for(let e=sy;e<y+r;e++)
  {
    if(mapf[e*maps+i]==0)
    {
      let d=(x-i)*(x-i)+(y-e)*(y-e);
      if(d<lowdist)
      {lowdist=d;}
    }
  }  
  
}
return lowdist;
  
  
  
}

function growpos(x,y)//tenta crescer planta em um quadrado.
{

if(mape[y*maps+x]<flc)return;//planta não crescerá em nível menor que a água.
if(round(secs)%round(random(2,3)*10)!=0)return;//apenas executa a função em um tempo aleatório certo.
if(x<0)return;
if(y<0)return;
if(x>maps-1)return;
if(y>maps-1)return;//impede de crescer fora do mapa.
if(mapf[y*maps+x]!=1)return;//impede de crescer em algo que não é terra.
if(waterdist(x,y,minwaterdist+20)>minwaterdist)return;//checa se terra é próxima suficiente da água.
mapf[y*maps+x]=2;
mapp[mapp.length]=2;
mapp[mapp.length]=x;
mapp[mapp.length]=y;//salva quadrado de planta no mapa.
dm(x,y,x+1,y+1);//redesenha o quadrado.
points+=1;//incrementa pontuação.
}


function growthRoutine()//rotina de crescimento para plantas.
{
 
  for(let i=0;i<mapp.length;i+=3)
  {
  
  let cx=mapp[i+1];
  let cy=mapp[i+2];//obtem as posições no mapa de plantas, descrito por <planta,x,y>.
  if(mapf[cy*maps+cx]!=0){
  growpos(cx+1,cy);
  growpos(cx-1,cy);
  growpos(cx,cy+1);
  growpos(cx,cy-1);//cresce aos arredores cardinais porém         excluindo diagonais.
  if(round(secs)%round(random(2,3)*10)!=0){//envelhece a planta após um tempo.
  mapf[cy*maps+cx]+=random(1,10)/20;//envelhece a planta por uma porcentagem aleatória.
    let age=mapf[cy*maps+cx];
    if(age>60)
    {mapf[cy*maps+cx]=-1;mapp.splice(i,3);}
  dm(cx,cy,cx+1,cy+1);//redesenha a planta envelhecida.
  }
  }else{mapp.splice(i,3);}
    
  }
  
}
function floodpos(p)//tenta inundar um espaço caso seja próximo de água.
{
if(round(secs/10)%round(random(5,10))!=0)return;//apenas executa a função em um tempo aleatório certo.
let cy=Math.floor(p/maps);
let cx=p-cy*maps;//converte posição.
if(waterdist(cx,cy,10)>2)return;//checa se água intersede quadrado.
  
  mapf[p]=0;//transforma em água
  dm(cx,cy,cx+1,cy+1);//redesenha
  mapfl.splice(p,1);//impede de refazer
  
}
function floodRoutine()//inunda quadrados próximos da água os quais são mais baixos que o nível da água.
{
  for(let i=0;i<mapfl.length;i++)
  {
  if(mape[mapfl[i]]<flc){
  floodpos(mapfl[i]);
  }
  }
}


function caction()//troca ferramenta atual
{
switch(curaction)
  {
    case 1:
    curaction=2;
    ctool="abrir água";
    break;
    case 2:
    curaction=3;
    ctool="limpar terra";
    break;
    case 3:
    curaction=1;
    ctool="plantar";
    break;
  }
}

/**/

function setup() {
  colorMode(RGB,256)//define a profundidade de cor como rgb.
  cmap();//configura o mapa do jogo usando a função perlin noise para criar terreno
  createCanvas(scrsx+120, scrsy);//cria um canvas com tamanho suficiente ao mapa e a interface do usuário.

  frameRate(30);
  background(220);//define a cor da interface
  trocarf=createButton('trocar ferramenta');
  trocarf.position(400,0);
  trocarf.mousePressed(caction);
  tentard=createButton('tentar novamente');
  tentard.position(400,220);
  tentard.mousePressed(reset);//define botões
  dm(0,0,maps,maps);//desenha o mapa inteiro pela primeira vez.
  oldx=0;
  oldy=0;
}



function draw() {
if(finish==1)return;//trava se o jogo for vencido.

curx=round((mouseX-sqrs/2)/sqrs);
cury=round((mouseY-sqrs/2)/sqrs);//grava o quadrado selecionado atual

let stx=oldx-2;
if(stx<0)stx=0;//não permite que o mapa seja redesenhado fora dos limites.
let sty=oldy-2;
if(sty<0)sty=0;//não permite que o mapa seja redesenhado fora dos limites.

let stx2=oldx+3;
if(stx2>maps)stx2=maps;//não permite que o mapa sobreponha a interface do usuário.
let sty2=oldy+3;
if(sty2>maps)sty2=maps;//não permite que o mapa sobreponha a interface do usuário.
  
dm(stx,sty,stx2,sty2);//redesenha apenas as posições nas quais o cursor sobrepôs anteriormente, aumentando o desempenho.
oldx=curx;oldy=cury;//grava as posições antigas do cursor.
floodRoutine();
growthRoutine();//executa as rotinas de crescimento de plantas.
dcursor();//desenha o cursor.
  
strokeWeight(0);
fill(0);
rect(400,0,700,400);
stroke(0);
strokeWeight(1);
fill("white");
textSize(15);
text("ferramenta atual:",405,40);
textSize(20);
text(ctool,410,60);
textSize(15);
text("pontos:",405,80);
textSize(20);
text(points,410,100);
textSize(15);
text("tempo:",405,120);
textSize(20);
text(Math.round(secs/10),410,140);
text("objetivo:",410,160);
fill("red");
text("dificuldade: "+difficulty,400,215);
fill("white");
textSize(15);
text("Conseguir "+objective,410,180);
text("pontos ou mais.",410,195);

text("Plante, distribua água e limpe a terra na menor quantia de tempo para vencer!",410,250,100,400)
  
  
secs+=1;

  
if(secs%100==0&&points>=100){//diminuir a pontuação por 100 a cada 100 milissegundos.
points-=100;

}
if(points>=objective)//apresentar mensagem de jogo vencido e aumentar a dificuldade, caso o jogador bater a meta atual.
{
  stroke(0);
  strokeWeight(10);
  fill("red");
  textSize(40);
  text("Conseguiu!",100,100);
  finish=1;
  objective+=500;
  difficulty+=1
}
mousecheck();

}

function reset()//altera todas as variáveis e o mapa em si para os valores padrões, além de re-gerar o mapa.
{
tentativa+=1;
curaction=1;
mape=[];
mapf=[];
mapp=[];
mapfl=[];
secs=0;
ctool="plantar";
points=0;
finish=0;
noiseSeed(random(1,1000));
cmap();
dm(0,0,maps,maps);
}