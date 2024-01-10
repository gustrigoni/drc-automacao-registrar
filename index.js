import { config } from 'dotenv';

config();

import axios from 'axios';
import FormData from 'form-data';
import nodeReadline from 'readline';

const URL_BFF = process.env.URL_BFF;

const readline = nodeReadline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const promptInput = async (pergunta) => {
  const respostaPrompt  = await new Promise((resolve, reject) => {
    readline.question(`${pergunta}\n`, resposta => {
      readline.close();
      return resolve(resposta);
    });
  })

  return respostaPrompt;
}

const executar = async () => {
  let senhaEspecifica = null;

  const senhaDigitada = await promptInput('Digite uma senha caso quiser uma especifica...');

  if (senhaDigitada) {
    senhaEspecifica = senhaDigitada;
  }

  try {
    const form = new FormData();

    form.append('acao', 'gerar_pessoa');
    form.append('sexo', 'I');
    form.append('pontuacao', 'S');
    form.append('idade', '0');
    form.append('txt_qtde', '1');

    const { data: [ dadoPessoal ]} = await axios.post('https://www.4devs.com.br/ferramentas_online.php', form);

    console.log(dadoPessoal);

    const senhaUsuario = senhaEspecifica ?? dadoPessoal.senha;
    const celular = dadoPessoal.celular.replace(' ', '');

    let dataNascimento = dadoPessoal.data_nasc.split('/').reverse().toString();

    for (let i = 1; i <= dataNascimento.length; i++) {
      dataNascimento = dataNascimento.replace(',', '');
    }

    const { data: { data }} = await axios.post(`${URL_BFF}/login/create`, {
      mail: dadoPessoal.email,
      celular: celular,
      senha: senhaUsuario,
      termo_aceite_sn: "S",
      nome: dadoPessoal.nome,
      nasc: dataNascimento,
      sexo: dadoPessoal.sexo.toLowerCase() === 'masculino' ? 'M' : 'F',
      cpf: dadoPessoal.cpf,
      google_id: "",
      facebook_id: "",
      apple_id: "",
      voucher: "",
      grp: "no-safety-mails"
    });

    const retorno = {
      nome: data.nome,
      email: data.mail,
      celular: celular,
      senha: senhaUsuario,
      ssid: data.ssid,
      idPaciente: data.id_paciente,
      idUsuario: data.id_usuario
    }
    
    console.log('[SUCESSO] Usuário cadastrado', retorno);
  } catch (error) {
    console.error('[ERRO] Não foi possível prosseguir', error)
  }
}

await executar();
process.exit(0);
