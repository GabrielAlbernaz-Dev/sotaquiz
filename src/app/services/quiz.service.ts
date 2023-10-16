import { Injectable } from '@angular/core';
import { collection, doc, getDocs, getFirestore, query, updateDoc, where, increment } from 'firebase/firestore';
import { DataSendQuiz } from '../interfaces/quiz';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  public firestore : any = getFirestore();
  public listOfLetters : Array<string> = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
  ];
  private questionAnswersList : any = [];
  public ufCollection;
  public questionCollection;
  public quizSendData : DataSendQuiz[] | [] = [];

  constructor() {
    this.ufCollection = collection(this.firestore, 'ufs');
    this.questionCollection = collection(this.firestore, 'questions');
    this.listOfLetters = this.shuffleArrayOfLetters(this.listOfLetters);
    this.setQuestionList();
  }

  async getQuestionsAnswers() {
    try {
      const questionDocs = await getDocs(this.questionCollection);
      const dataDoc: { answers?: any[] }[] = questionDocs.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { answers?: any[] })
      }));

      const firstDocWithAnswers = dataDoc.find((doc) => doc.answers);
      if (firstDocWithAnswers && firstDocWithAnswers.answers) {
        return firstDocWithAnswers.answers;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  async setDataUfs(): Promise<string[]> {
    try {
      const ufDocs = await getDocs(this.ufCollection);
      const dataDoc: { ufs?: any[] }[] = ufDocs.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { ufs?: any[] })
      }));

      const firstDocWithUfs = dataDoc.find((doc) => doc.ufs);
      if (firstDocWithUfs && firstDocWithUfs.ufs) {
        return firstDocWithUfs.ufs;
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  async setQuestionList() {
    const docs = await getDocs(collection(this.firestore, 'questions'));
    const dataDoc: { answers?: any[] }[] = docs.docs.map((doc) => ({
      ...(doc.data() as { answers?: any[] })
    }));

    if(dataDoc[0].answers) {
      this.questionAnswersList = dataDoc[0].answers;
    }
  }

  private shuffleArrayOfLetters(array : Array<string>) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  public getCorrectAnswers() {
    return this.quizSendData.filter(answer => answer.isCorrect);
  }

  public setQuizSendData(btns : HTMLButtonElement[]) {
    this.quizSendData = btns.map(btn => {
      let { uf, letterAnswer } = btn.dataset;
      const correctAnswer = this.questionAnswersList.find((answer: { audioLetter: string | undefined; }) => answer.audioLetter === letterAnswer);
      return {
        answerValue:uf = undefined ? '' : uf,
        isCorrect: correctAnswer ? (correctAnswer.correctValue === uf) : false,
      }
    });
  }

  public sendStateCounters() {
    this.getCorrectAnswers().forEach(async (answer) => {
      if (answer && answer.answerValue) {
        const answerValueUppercase : string = answer.answerValue.toUpperCase();
        try {
          const docSnap = await getDocs(query(collection(this.firestore, 'statesAnswersCount'), where(answerValueUppercase, '>=', 0)));
          if (docSnap.docs.length > 0) {
            const docRef = doc(this.firestore, 'statesAnswersCount', docSnap.docs[0].id);
            const fieldToUpdate = answerValueUppercase;
            const updateData = { [fieldToUpdate]: increment(1) };
            await updateDoc(docRef, updateData);
          }
        } catch (error) {
          return;
        }
      }
    });
  }

  //Getters
  public getQuestionAnswersList() {
    return this.questionAnswersList;
  }
}
