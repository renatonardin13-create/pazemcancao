export interface Track {
  id: number;
  title: string;
  duration: string;
  category: string;
  audioUrl: string;
  downloadUrl: string;
  description: string;
}

export const sampleTracks: Track[] = [
  { id: 1, title: "Quando a Alma Chora", duration: "4:12", category: "Cura", audioUrl: "/audio/01.mp3", downloadUrl: "/downloads/01.mp3", description: "Para os dias em que as lágrimas falam mais que as palavras. Um abraço sonoro para a alma ferida." },
  { id: 2, title: "No Silêncio da Madrugada", duration: "3:45", category: "Madrugada", audioUrl: "/audio/02.mp3", downloadUrl: "/downloads/02.mp3", description: "Quando o mundo dorme e só você e Deus estão acordos. Uma canção para seus momentos mais íntimos." },
  { id: 3, title: "Respira Deus Outra Vez", duration: "5:01", category: "Oração", audioUrl: "/audio/03.mp3", downloadUrl: "/downloads/03.mp3", description: "Um suspiro transformado em melodia. Para quando você precisa sentir o fôlego de Deus renovando tudo." },
  { id: 4, title: "Força Para Continuar", duration: "4:33", category: "Força", audioUrl: "/audio/04.mp3", downloadUrl: "/downloads/04.mp3", description: "Para quem pensou em desistir, mas ainda está de pé. Sua força vem de um lugar que o mundo não entende." },
  { id: 5, title: "Cura o Que Ninguém Vê", duration: "3:58", category: "Cura", audioUrl: "/audio/05.mp3", downloadUrl: "/downloads/05.mp3", description: "Existem feridas invisíveis que só Deus conhece. Esta canção é um bálsamo para o que ninguém enxerga." },
  { id: 6, title: "Paz em Meio ao Caos", duration: "4:20", category: "Paz", audioUrl: "/audio/06.mp3", downloadUrl: "/downloads/06.mp3", description: "Quando tudo ao redor desmorona, existe uma paz que não depende das circunstâncias. Ela mora em você." },
  { id: 7, title: "O Céu Ainda Me Vê", duration: "3:42", category: "Presença", audioUrl: "/audio/07.mp3", downloadUrl: "/downloads/07.mp3", description: "Mesmo quando você se sente esquecido, os olhos do Pai nunca se desviam de você. Ele te vê." },
  { id: 8, title: "Oração Sem Palavras", duration: "5:15", category: "Oração", audioUrl: "/audio/08.mp3", downloadUrl: "/downloads/08.mp3", description: "Às vezes, a oração mais poderosa é aquela feita em silêncio, com o coração partido diante de Deus." },
  { id: 9, title: "Quando Só Deus Entende", duration: "4:08", category: "Refúgio", audioUrl: "/audio/09.mp3", downloadUrl: "/downloads/09.mp3", description: "Há situações que ninguém compreende. Mas existe Alguém que entende cada detalhe do que você sente." },
  { id: 10, title: "Refúgio no Secreto", duration: "3:55", category: "Refúgio", audioUrl: "/audio/10.mp3", downloadUrl: "/downloads/10.mp3", description: "Um convite para se esconder debaixo das asas do Altíssimo. Seu lugar seguro já está preparado." },
  { id: 11, title: "Ainda Estou de Pé", duration: "4:27", category: "Força", audioUrl: "/audio/11.mp3", downloadUrl: "/downloads/11.mp3", description: "Depois de tudo o que você passou, o milagre é que você ainda está aqui. E isso não é pouco." },
  { id: 12, title: "Luz na Noite Escura", duration: "3:39", category: "Madrugada", audioUrl: "/audio/12.mp3", downloadUrl: "/downloads/12.mp3", description: "A escuridão nunca é o fim da história. Sempre existe uma luz que insiste em brilhar por você." },
  { id: 13, title: "Acalma Minha Mente", duration: "4:50", category: "Paz", audioUrl: "/audio/13.mp3", downloadUrl: "/downloads/13.mp3", description: "Para os pensamentos que não param, as preocupações que sufocam. Uma melodia que silencia a ansiedade." },
  { id: 14, title: "Meu Abrigo é Tua Presença", duration: "3:30", category: "Presença", audioUrl: "/audio/14.mp3", downloadUrl: "/downloads/14.mp3", description: "Não é um lugar físico, é uma Presença. E quando ela chega, tudo muda. Tudo se aquieta." },
  { id: 15, title: "Deus Está Aqui", duration: "5:22", category: "Presença", audioUrl: "/audio/15.mp3", downloadUrl: "/downloads/15.mp3", description: "Simples assim. Sem explicação. Sem dúvida. Ele está. Aqui. Agora. Com você." },
  { id: 16, title: "Mesmo Ferido, Eu Creio", duration: "4:15", category: "Força", audioUrl: "/audio/16.mp3", downloadUrl: "/downloads/16.mp3", description: "A fé não nasce na ausência de dor, mas na decisão de confiar mesmo quando dói." },
  { id: 17, title: "Descanso Para o Coração", duration: "3:48", category: "Paz", audioUrl: "/audio/17.mp3", downloadUrl: "/downloads/17.mp3", description: "Seu coração cansou de lutar. Essa canção é permissão divina para simplesmente descansar." },
  { id: 18, title: "Não Estou Sozinho", duration: "4:02", category: "Refúgio", audioUrl: "/audio/18.mp3", downloadUrl: "/downloads/18.mp3", description: "A solidão mente. Você nunca esteve sozinho. E nunca estará. Esta canção é a prova sonora disso." },
  { id: 19, title: "Tua Paz Me Sustenta", duration: "5:10", category: "Paz", audioUrl: "/audio/19.mp3", downloadUrl: "/downloads/19.mp3", description: "Quando tudo balança, existe algo que permanece firme dentro de você. É a paz que vem do alto." },
  { id: 20, title: "Canção Para Dias Difíceis", duration: "3:35", category: "Cura", audioUrl: "/audio/20.mp3", downloadUrl: "/downloads/20.mp3", description: "Feita especialmente para os dias em que levantar da cama já é um ato de coragem." },
  { id: 21, title: "Esperança no Vale", duration: "4:40", category: "Força", audioUrl: "/audio/21.mp3", downloadUrl: "/downloads/21.mp3", description: "O vale é passagem, não moradia. E mesmo ali, a esperança floresce quando menos se espera." },
  { id: 22, title: "A Tua Voz Me Encontra", duration: "3:52", category: "Oração", audioUrl: "/audio/22.mp3", downloadUrl: "/downloads/22.mp3", description: "No meio do barulho, uma voz suave e firme chama seu nome. Pare. Ouça. Ele está falando com você." },
  { id: 23, title: "Céu Sobre Mim", duration: "4:18", category: "Presença", audioUrl: "/audio/23.mp3", downloadUrl: "/downloads/23.mp3", description: "O céu não está longe. Ele se inclina sobre você a cada instante, cobrindo seus passos de graça." },
  { id: 24, title: "Quando Eu Não Consigo Orar", duration: "5:05", category: "Oração", audioUrl: "/audio/24.mp3", downloadUrl: "/downloads/24.mp3", description: "Para os momentos em que as palavras não saem. Quando o Espírito intercede com gemidos que você não precisa traduzir." },
  { id: 25, title: "Perto em Meio à Dor", duration: "3:44", category: "Cura", audioUrl: "/audio/25.mp3", downloadUrl: "/downloads/25.mp3", description: "A dor não afasta Deus. Pelo contrário — é nos momentos mais difíceis que Ele se aproxima ainda mais." },
  { id: 26, title: "Tua Presença é Meu Lugar", duration: "4:30", category: "Refúgio", audioUrl: "/audio/26.mp3", downloadUrl: "/downloads/26.mp3", description: "Você não precisa ir a lugar nenhum. Onde Ele está, ali é o seu lar. Ali é seguro." },
  { id: 27, title: "Amanhecer da Alma", duration: "3:56", category: "Madrugada", audioUrl: "/audio/27.mp3", downloadUrl: "/downloads/27.mp3", description: "Depois da noite mais longa, o sol volta a nascer dentro de você. Um novo dia começa na alma." },
  { id: 28, title: "Graça Para Recomeçar", duration: "4:22", category: "Cura", audioUrl: "/audio/28.mp3", downloadUrl: "/downloads/28.mp3", description: "Todo recomeço é um ato de graça. Você não precisa ser perfeito — só precisa ser corajoso o bastante para tentar de novo." },
  { id: 29, title: "Segura Minha Mão", duration: "5:00", category: "Presença", audioUrl: "/audio/29.mp3", downloadUrl: "/downloads/29.mp3", description: "Um pedido simples e profundo. Segura, Senhor. Não me solta. Eu preciso de Ti agora." },
  { id: 30, title: "Até Aqui, Deus Me Sustentou", duration: "6:12", category: "Força", audioUrl: "/audio/30.mp3", downloadUrl: "/downloads/30.mp3", description: "O louvor final. Um testemunho em forma de canção. Você chegou até aqui — e não foi sozinho." },
];
