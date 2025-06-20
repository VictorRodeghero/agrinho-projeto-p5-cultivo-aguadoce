/*Submetido ao projeto Agrinho do Estado do Paraná, 2025
Programado, inteiramente, por Victor Rodeghero, utilizando da biblioteca p5.js, sem utilizar qualquer recurso de propriedade externa ou de Inteligencia Artificial
Colégio Estadual Cívico Militar Santa Tereza do Oeste
Santa Tereza do Oeste, 2025.*/


/*interface*/
let trocarf;
let tentard;
/**/

/*constantes*/
const tamanhomapa=120;//tamanho do mapa
const suavidade=0.04// quao liso, natural e menos fragmentado o mapa é gerado, sendo valores maiores mais quebrados e valores menores mais lisos.
const nivelagua=120;//nivel da água, de 0 a 256
const tamanhoquadro=7;//tamanho de cada quadrado, em pixels.
const tamanhoui=200;//tamanho da interface, horizontal.
const tamanhox=800;//largura da tela em pixels
const tamanhoy=600;//altura da tela em pixels
const distaguamax=20;//distância maxima da água até uma planta para que ela cresca. 
const acrescdificuldade=1000;//incremento ao objetivo a cada vez que o jogador vence.

/*variáveis*/
var xatual,yatual;//posição do quadrado selecionado atualmente no mapa;
let canvas;//canvas do jogo.
var xantigo=0,yantigo=0;//ultimas posições do quadrado selecionado.
var ferramenta=1;//ação atual selecionada a ser efetuada após o clique do cursor.
var mapaprofundidade=[];// mapa do jogo, em valores de 1 a 256, sendo cada valor uma altura.
var mapaobjeto=[];// mapa do jogo, descrevendo objetos.
var mapaplanta=[];//mapa do jogo, descrevendo plantas
var mapadepressao=[];//mapa do jogo, descrevendo depressões.
var escala=40/tamanhomapa;//escala de objetos para tamanho da tela.
var objetos=[
[0,0,10,0,0,1,0,10,10,1,10,10,9,10,1,10]//quadrado
];//vetores de objetos vetoriais;
var segundos=0;//contador de segundos.
var ferramentan="plantar";//ação/ferramenta atual, em texto.
var estadomouse=0;//estado do mouse, 1 é pressionado.
var pontos=0;//pontos por cada planta que cresce,descontados do tempo.
var vencido=0;//caso for 1, fim de jogo.
var tentativa=0;//quantia de tentativas, usada para gerar mapas diferentes.
var objetivo=5000;//objetivo de pontos, aumenta a cada vez que o jogador vence.
var dificuldade=1;//incrementado cada vez que o jogador vence.
var estadojogo=2;
var intermtempo=0;
var stripesoff=[];
var intermimg;//imagem distorcida da tela usada para fim de jogo
var intermimgb;//fundo real da tela usada para fim de jogo





/*Funções*/

function criarmapa()//criar mapa usando perlin noise.
{
for(let y=0;y<tamanhomapa;y++)//para cada posição y de um quadrado vazio,
{
for(let x=0;x<tamanhomapa;x++)// e para cada posição x de um quadrado vazio:
  {
    let nv=noise(x*suavidade,y*suavidade);//calcular altura de quadrado
    let smv=100;//fator de arredondamento da altura; quanto maior, mais tons podem aparecer no mapa.
    let ci=round(nv*smv)/smv*256
    mapaprofundidade[y*tamanhomapa+x]=ci;//imprimir o valor arredondado na memória do mapa.
    if(ci<nivelagua)//se valor menor que nivel da água, então:
    {
    mapaobjeto[y*tamanhomapa+x]=0;//cor do quadrado é azul.
    }
    else
    {
    mapaobjeto[y*tamanhomapa+x]=1;//senão, cor do quadrado é marrom.      
    }
  }
}
  
}




function desenharmapa(ofx,ofy,sx,sy)//desenha uma parcela do mapa.
{
  
for(let y=ofy;y<(sy);y++)//para cada valor y do mapa,
{
for(let x=ofx;x<(sx);x++)// e para cada valor x do mapa:
  {
    strokeWeight(0);//quadrados sem bordas
    let ci=mapaprofundidade[y*tamanhomapa+x];//altura de cada quadrado do mapa, de 1 a 256
    let c=color(ci,ci,ci);//cor cinza, para se, em algum caso, um quadrado não ser terra nem água.
    
    switch(mapaobjeto[y*tamanhomapa+x]){
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
      
    if(mapaobjeto[y*tamanhomapa+x]>1){//se quadrado for planta:
      let idade=mapaobjeto[y*tamanhomapa+x];
      //ci*5/6 é o valor final do vermelho.
      c=lerpColor(color(0,ci*3/4,0),color(ci*5/6,ci*3/4,0),idade/50);//tonalizar do verde ao amarelo dependendo da idade da planta.
     
        }
    
    fill(c);//muda para a cor determinada.
    rect(x*tamanhoquadro,y*tamanhoquadro,tamanhoquadro,tamanhoquadro);//imprimir quadrado.
    
    
  }
}
  
}


function desenhaobj(obj,x,y,c)//imprime um objeto vetorial
{
  for(let xi=0;xi<obj.length;xi+=4)
    {

    strokeWeight(1);
    stroke(c);
    line(obj[xi]*escala+x,obj[xi+1]*escala+y,obj[xi+2]*escala+x,obj[xi+3]*escala+y);//desenha todas as linhas de acordo com as posições em 2 pares de coordenadas na array de objeto.
    
    }
}
function desenharcursor()//imprime o cursor.
{
let mx;
let my;
mx=round((mouseX-tamanhoquadro/2)/tamanhoquadro)*tamanhoquadro;
my=round((mouseY-tamanhoquadro/2)/tamanhoquadro)*tamanhoquadro;//converte quadrado selecionado  para o tamanho do quadrado

if(mx>tamanhox-tamanhoquadro/2||my>tamanhoy-tamanhoquadro/2)return;

desenhaobj(objetos[0],mx,my,color(256,256,256,256));//imprime o cursor.
}

function afundarposicao(x,y)//abaixa uma posição do mapa e a torna vazia.
{
      if(mapaprofundidade[y*tamanhomapa+x]<nivelagua)return;
      if(mapaobjeto[y*tamanhomapa+x]!=0&&x<tamanhomapa)
      {
      mapaprofundidade[y*tamanhomapa+x]=nivelagua-20-round(random(1,2)*20);
      mapaobjeto[y*tamanhomapa+x]=1;
      mapadepressao[mapadepressao.length]=y*tamanhomapa+x;//adiciona ao mapa de depressões.
      
      desenharmapa(x,y,x+1,y+1);//atualiza a depressão.
      }
}

function limparposicao(x,y)//abaixa uma posição do mapa e a torna vazia.
{
      if(mapaobjeto[y*tamanhomapa+x]==-1)
      {
      mapaobjeto[y*tamanhomapa+x]=1;//recolore como terra.
      desenharmapa(x,y,x+1,y+1);//atualiza a posição.
      }
}
function afundar(x,y,ex,ey)//abaixa o mapa da posição x,y até a ex,ey.
{
  for(let i=y;i<ey;i++)
  {
    for(let e=x;e<ex;e++)
    {
    afundarposicao(e,i);//afunda o tamanho todo da ferramenta.
    }
  
  }

}

function limpar(x,y,ex,ey)//limpa o mapa da posição x,y até a ex,ey.
{
  for(let i=y;i<ey;i++)
  {
    for(let e=x;e<ex;e++)
    {
    limparposicao(e,i);//limpa o tamanho todo da ferramenta.
    }
  
  }

}

function keyPressed()//reage ao estado atual das teclas 1,2 e 3.
{
if(key=="1")
{
ferramenta=1;
ferramentan="plantar";
}
if(key=="2")
{
ferramenta=2;
ferramentan="abrir água";
}
if(key=="3")
{
ferramenta=3;
ferramentan="limpar terra";
}
  
  
}

function checarmouse()//reage ao estado atual do mouse.
{
if(estadomouse!=1)return;//não faz nada caso mouse não estiver pressionado.
  switch(ferramenta){
    case 1:
      if(distagua(xatual,yatual,distaguamax+20)>distaguamax)return;//não permite o plantio longe da água.
    switch(mapaobjeto[yatual*tamanhomapa+xatual])
      {
        case 1:
        mapaobjeto[yatual*tamanhomapa+xatual]=2;//grava no mapa visivel um quadrado verde.
        mapaplanta[mapaplanta.length]=0;//grava a planta no mapa de plantas.
        mapaplanta[mapaplanta.length]=xatual;
        mapaplanta[mapaplanta.length]=yatual;//grava a posição desta planta, em x e y.
        break;
      }
      
      break;
      case 2:
      
      afundar(xatual-1,yatual-1,xatual+2,yatual+2);//abaixa um quadrado 3x3 ao usar a ferramenta "abrir rio".
    
      break;
      case 3:
      
      limpar(xatual-4,yatual-4,xatual+4,yatual+4);//limpa um quadrado 9x9 ao usar a ferramenta "limpar terra".
    
      break;
  }
}
function mousebaixo(){estadomouse=1;}
function mousecima(){estadomouse=0;}
document.addEventListener('mousedown',mousebaixo);
document.addEventListener('mouseup',mousecima);//atualiza eventos do mouse.

function distagua(x,y,r){//determina a distancia de um quadrado até a fonte de água mais próxima.
let sx=x-r;
let sy=y-r;
let menordistancia=r*r;
for(let i=sx;i<x+r;i++)
{
  for(let e=sy;e<y+r;e++)
  {
    if(mapaobjeto[e*tamanhomapa+i]==0)
    {
      let d=(x-i)*(x-i)+(y-e)*(y-e);//calcula distancia, porém não usa raiz quadrada.
      if(d<menordistancia)
      {menordistancia=d;}
    }
  }  
  
}
return menordistancia;
  
  
  
}

function crescerposicao(x,y,id)//tenta crescer planta em um quadrado.
{
if(mapaobjeto[y*tamanhomapa+x]!=1)return;//impede de crescer em algo que não é terra.

if(mapaprofundidade[y*tamanhomapa+x]<nivelagua)return;//planta não crescerá em nível menor que a água.
if(x<0)return;
if(y<0)return;
if(x>tamanhomapa-1)return;
if(y>tamanhomapa-1)return;//impede de crescer fora do mapa.
if(distagua(x,y,distaguamax+20)>distaguamax)return;//checa se terra é próxima suficiente da água.
mapaobjeto[y*tamanhomapa+x]=2;
mapaplanta[mapaplanta.length]=0;
mapaplanta[mapaplanta.length]=x;
mapaplanta[mapaplanta.length]=y;//salva quadrado de planta no mapa.
desenharmapa(x,y,x+1,y+1);//redesenha o quadrado.
pontos+=1;//incrementa pontuação.
if(pontos%1000==0){toquegrande.play()}//toca um som caso a quantia de pontos alcance um incremento de 1000.
mapaplanta[id]+=1;//adiciona ao mapa de plantas.
return 1;
}


function rotinaCrescimento()//rotina de crescimento para plantas.
{
 
  for(let i=0;i<mapaplanta.length;i+=3)
  {
  
  let cx=mapaplanta[i+1];
  let cy=mapaplanta[i+2];//obtem as posições no mapa de plantas, descrito por <planta,x,y>.
  if(mapaobjeto[cy*tamanhomapa+cx]>-1){
  if(mapaplanta[i]<2&&round(segundos)%round(random(2,3)*10)==0)
  {
  crescerposicao(cx+1,cy,i);
  crescerposicao(cx-1,cy,i);
  crescerposicao(cx,cy+1,i);
  crescerposicao(cx,cy-1,i);//cresce aos arredores cardinais porém excluindo diagonais.
  }
  if(mapaplanta[i]<=60&&round(segundos)%round(random(2,3)*10)==0){//envelhece a planta após um tempo.
  mapaobjeto[cy*tamanhomapa+cx]+=random(1,10)/2;//envelhece a planta por uma porcentagem aleatória.
    let age=mapaobjeto[cy*tamanhomapa+cx];
    if(age>60){mapaobjeto[cy*tamanhomapa+cx]=-1;mapaplanta.splice(i,3);}//remove a planta do mapa, caso ela morra.
  desenharmapa(cx,cy,cx+1,cy+1);//redesenha a planta envelhecida.
  }
  
  }else{mapaplanta.splice(i,3);}//mata a planta se ela estiver em terra morta.
    
  }
  
}
function inundarposicao(p)//tenta inundar um espaço caso seja próximo de água.
{
if(round(segundos)%round(random(2,3)*10)==0)return;//apenas executa a função em um tempo aleatório certo.
let cy=Math.floor(p/tamanhomapa);
let cx=p-cy*tamanhomapa;//converte posição.
if(distagua(cx,cy,10)>2)return;//checa se água intersede quadrado.
  
  mapaobjeto[p]=0;//transforma em água
  desenharmapa(cx,cy,cx+1,cy+1);//redesenha
  mapadepressao.splice(p-1,1);//impede de refazer
  
}
function rotinaInundacao()//inunda quadrados próximos da água os quais são mais baixos que o nível da água.
{
  for(let i=0;i<mapadepressao.length;i++)
  {
  if(mapaprofundidade[mapadepressao[i]]<=nivelagua){
  inundarposicao(mapadepressao[i]);//tenta inundar todas as posições no mapa.
  }
  }
}


function caction()//troca ferramenta atual
{
switch(ferramenta)
  {
    case 1:
    ferramenta=2;
    ferramentan="abrir água";
    break;
    case 2:
    ferramenta=3;
    ferramentan="limpar terra";
    break;
    case 3:
    ferramenta=1;
    ferramentan="plantar";
    break;
  }
}


function configurarbotoes()//define botões
{
  let sc=tamanhox/600;//escala do jogo relativo à tela original.
  trocarf=createButton('trocar ferramenta');
  trocarf.position(canvas.position().x+tamanhox-tamanhoui,0);
  trocarf.mousePressed(caction);
  tentard=createButton('tentar novamente');
  tentard.position(canvas.position().x+tamanhox-tamanhoui,220*sc);
  tentard.mousePressed(reset);
  trocarf.hide();
  tentard.hide();//esconde os botões e apenas os mostra quando o jogador sair da tela de titulo.
  trocarf.child(document.body.main);
  tentard.child(document.body.main);
}

function ui()//interface
{
let sc=tamanhox/600;
let ix=tamanhox-tamanhoui+5;
strokeWeight(0);
fill(0);
rect(tamanhox-tamanhoui,0,tamanhox,tamanhoy);
stroke(0);
strokeWeight(1);
fill("white");
textSize(15*sc);
text("ferramenta atual:",ix,40*sc);
textSize(20*sc);
text(ferramentan,ix,60*sc);
textSize(15*sc);
text("pontos:",ix,80*sc);
textSize(20*sc);
text(pontos,ix,100*sc);
textSize(15*sc);
text("tempo:",ix,120*sc);
textSize(20*sc);
text(Math.round(segundos/10),ix,140*sc);
text("objetivo:",ix,160*sc);
fill("red");
text("dificuldade: "+dificuldade,ix,215*sc);
fill("white");
textSize(15*sc);
text("Conseguir "+objetivo,ix,180*sc);
text("pontos ou mais.",ix,195*sc);

text("Plante, distribua água e limpe a terra na menor quantia de tempo para vencer!",ix,250*sc,100*sc,400*sc);
//text(round(frameRate())+" FPS",ix,500*sc);//mostraria o contador de fps para razões de debug.
  trocarf.position(canvas.position().x+tamanhox-tamanhoui,0);
  tentard.position(canvas.position().x+tamanhox-tamanhoui,220*sc);//reposiciona os botões para sempre estarem na posição devida.
}



function salvarcolunas(a)//salva a tela para uso em efeitos.
{
let cur;
let tbase=600;
let tbaseq=5;//tamanho e escala original.

if(a==1){tbase=tamanhoy;tbaseq=tamanhoquadro;}//mantem a escala atual, uma vez que a primeira imagem(intermimgb) tem que ser exatamente igual à tela que o jogador verá após o efeito.
cur=createImage(tbase,tbase);//cria a imagem a ser usada para salvar a tela.

stripesoff[0]=random(20,40);//define um "offset" aleatório para usar no efeito de derretimento da tela de intermissão.

cur.loadPixels();
//utiliza o mesmo algoritmo que desenharmapa(), para clonar a tela e salva-la para o efeito de intermissao.
for(let i=0;i<tbase;i++)
{
stripesoff[i+1]=stripesoff[i]+round(random(-1,1));
  for(let e=0;e<tbase;e++)
  {
  let x=floor(i/tbaseq);
  let y=floor(e/tbaseq);
  let ci=mapaprofundidade[y*tamanhomapa+x];//altura de cada quadrado do mapa, de 1 a 256
    
    let c=color(ci,ci,ci);//cor cinza, para se, em algum caso, um quadrado não ser terra nem água.
    
    switch(mapaobjeto[y*tamanhomapa+x]){
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
      
    if(mapaobjeto[y*tamanhomapa+x]>1){
      let idade=mapaobjeto[y*tamanhomapa+x];
      c=lerpColor(color(0,ci*3/4,0),color(ci*5/6,ci*3/4,0),idade/50);//denovo, utiliza o mesmo algoritmo que desenharmapa().
     
        }
    

    if(estadojogo==2){
      cur.set(i,e,color(0,0,192))//faz com que a tela seja completamente azul se o jogador estava na tela de titulo.
    }
    else{
      cur.set(i,e,c);//caso contrário, copia o mapa normalmente.
    }
  }
}
  cur.updatePixels();
if(a==0){intermimg=cur;}
if(a==1){intermimgb=cur;}//define em qual variavel global a tela será salva dependendo da chamada da função.
}

function intermissao(frame,desconto)//anima a tela de intermissão.
{
let img=createImage(600,600);
//4=600
//x=tamanhox-tamanhoui
let sm=4;//suavidade da tela de intermissão; largura de cada coluna.

for(let i=0;i<tamanhox-tamanhoui;i+=2)
{
let of=0;

if(stripesoff[i]<0){of=-stripesoff[i];}
stripesoff[i]-=1;
img.copy(intermimg,i,0,sm,tamanhoy,i,of*4,sm,tamanhoy);//copia todas as colunas em um tamanho especificado e com um "offset".
}

image(intermimgb,0,0);//faz com que a próxima tela surja lentamente durante o efeito
let f=frame-desconto;
if(frame<desconto)f=0;//apenas começa a descer a tela após um periodo especificado pela chamada da função.
if(frame==150)toqueintermissao.play();//toca um som, após a tela estar caindo.
img.resize(tamanhox-tamanhoui,0);//re-escala a tela anterior distorcida. para o tamanho real da tela de intermissão
image(img,0,map(f,0,600,0,tamanhoy));//finalmente, imprime a tela distorcida com um caimento especificado pela função.
}

function telatitulo(frame)//imprime a tela de titulo.
{
let sc=tamanhoy/600;//escala todos os elementos a caberem com tamanho e posição apropriadas.
fill("#0000b0");
strokeWeight(0);
rect(0,0,tamanhox,tamanhoy);
strokeWeight(5*sc);
stroke(255);
fill("blue");
textSize(50*sc);
text("Cultivo em Água Doce",600*sc-10*sc*50,250*sc);
strokeWeight(sc);
fill(255);
textSize(25*sc);
text("Clique na tela para iniciar!",600*sc-(14*sc*25),350*sc);
}



function reset()//altera todas as variáveis e o mapa em si para os valores padrões, executa a tela de intermissao além de re-gerar o mapa.
{
if(estadojogo==1)return;//não permite o jogador reiniciar o jogo caso já tenha apertado o botão e esteja na tela de intermissão.
toquepequeno.play();//toca um som para avisar o jogador de que ele apertou o botão, uma vez que a tela de intermissão demora para carregar.
salvarcolunas(0);//salva a tela atual.
estadojogo=1;
tentativa+=1;
ferramenta=1;
mapaprofundidade=[];
mapaobjeto=[];
mapaplanta=[];
mapadepressao=[];
segundos=0;
ferramentan="plantar";
tentard.html("tentar novamente")//volta ao estado normal do botão.
pontos=0;
vencido=0.5;
noiseSeed(random(1,1000));
criarmapa();//regera o mapa.
}
/**/

/*Som*/
let toquegrande;//toca ao obter multiplos de 1000 pontos.
let toqueintermissao;
let toquepequeno;
function preload()//carrega todos os sons do jogo.
{
soundFormats('mp3','ogg');//especifica os formatos de som que podem ser carregados.
toquegrande=loadSound('assets/bigring.ogg');
toqueintermissao=loadSound('assets/distortring.ogg');
toquepequeno=loadSound('assets/smallring.ogg');
}


/**/

function setup() {
  colorMode(RGB,256)//define a profundidade de cor como rgb.
  criarmapa();//configura o mapa do jogo usando a função perlin noise para criar terreno
  canvas=createCanvas(tamanhox, tamanhoy);//cria um canvas com tamanho suficiente ao mapa e a interface do usuário.
  canvas.id("canvas");
  frameRate(60);
  configurarbotoes();//define e inicia os botões da interface.

  canvas.mouseClicked(()=>{
  if(estadojogo==2)
  {
  reset();//começa o jogo, se estiver na tela de titulo e o canvas for clicado.
  }
  })
}





function draw() {

  
if(estadojogo==2)
{
telatitulo();//se estiver na tela de titulo, desenhá-la.
return;
}
if(estadojogo==1&&vencido==1)
{
intermissao(intermtempo,100);//mostra a tela de intermissão, com um atraso para fazê-la fluir melhor.
intermtempo+=5;//gradualmente a abaixa.
if(intermtempo>tamanhoy){estadojogo=0;vencido=0;intermtempo=0;trocarf.show();tentard.show()}//mostra os botões se a tela de intermissão tiver acabado, alem de reiniciar seus valores e impedir que aconteça repetidamente.
}
if(vencido==1)return;//trava se o jogo for vencido.
if(vencido==0.5){vencido=1;salvarcolunas(1);return;}//salva a tela subsequente para a tela de intermissão.
  

xatual=round((mouseX-tamanhoquadro/2)/tamanhoquadro);
yatual=round((mouseY-tamanhoquadro/2)/tamanhoquadro);//grava o quadrado selecionado atual

let stx=xantigo-2;
if(stx<0)stx=0;//não permite que o mapa seja redesenhado fora dos limites.
let sty=yantigo-2;
if(sty<0)sty=0;//não permite que o mapa seja redesenhado fora dos limites.

let stx2=xantigo+3;
if(stx2>tamanhomapa)stx2=tamanhomapa;//não permite que o mapa sobreponha a interface do usuário.
let sty2=yantigo+3;
if(sty2>tamanhomapa)sty2=tamanhomapa;//não permite que o mapa sobreponha a interface do usuário.
  
desenharmapa(stx,sty,stx2,sty2);//redesenha apenas as posições nas quais o cursor sobrepôs anteriormente, aumentando o desempenho.

xantigo=xatual;yantigo=yatual;//grava as posições antigas do cursor.
  
rotinaCrescimento();//executa as rotinas de crescimento de plantas.
rotinaInundacao();//executa a rotina de inundação de rios feitos pelo jogador.


desenharcursor();//desenha o cursor.
ui();//apresenta a interface.

  
  
segundos+=1;//incrementa a cada frame.
checarmouse();//atualiza o estado do mouse.
if((segundos)%10==0&&pontos>=100){
pontos-=10;//diminuir a pontuação por 10 a cada 10 milissegundos.
}
if(pontos>=objetivo)//apresentar mensagem de jogo vencido e aumentar a dificuldade, caso o jogador bater a meta atual.
{
  stroke(0);
  strokeWeight(10);
  fill("red");
  textSize(40);
  text("Conseguiu!",(tamanhox-tamanhoui)/2-20*5,tamanhoy/2);
  tentard.html("próximo nível")
  console.log(tentard.html())
  vencido=1;//pausa o jogo até o jogador clicar no botão "próximo nível".
  objetivo+=acrescdificuldade;//aumenta o objetivo de pontos.
  dificuldade+=1;//aumenta a dificuldade.
}

}
