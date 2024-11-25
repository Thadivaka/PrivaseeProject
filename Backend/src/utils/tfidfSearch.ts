interface TFIDFDocument {
    id: string;
    terms: Map<string, number>;
    vector: number[];
  }
  
  export class TFIDFSearchEngine {
    private documents: TFIDFDocument[] = [];
    private terms: Set<string> = new Set();
    private idfValues: Map<string, number> = new Map();
    
    private preprocessText(text: string): string[] {
      return text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
    }
  
    public clear(): void {
        this.documents = [];
      }

    private calculateTermFrequency(terms: string[]): Map<string, number> {
      const termFreq = new Map<string, number>();
      terms.forEach(term => {
        termFreq.set(term, (termFreq.get(term) || 0) + 1);
      });
      return termFreq;
    }
  
    private calculateIDF(): void {
      const N = this.documents.length;
      this.terms.forEach(term => {
        const documentCount = this.documents.filter(doc => 
          doc.terms.has(term)
        ).length;
        this.idfValues.set(term, Math.log(N / (1 + documentCount)));
      });
    }
  
    private calculateVector(terms: Map<string, number>): number[] {
      return Array.from(this.terms).map(term => {
        const tf = terms.get(term) || 0;
        const idf = this.idfValues.get(term) || 0;
        return tf * idf;
      });
    }
  
    private cosineSimilarity(vec1: number[], vec2: number[]): number {
      let dotProduct = 0;
      let norm1 = 0;
      let norm2 = 0;
  
      for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
      }
  
      norm1 = Math.sqrt(norm1);
      norm2 = Math.sqrt(norm2);
  
      return dotProduct / (norm1 * norm2) || 0;
    }
  
    public addDocument(id: string, text: string): void {
      const terms = this.preprocessText(text);
      terms.forEach(term => this.terms.add(term));
      
      const termFreq = this.calculateTermFrequency(terms);
      this.documents.push({ id, terms: termFreq, vector: [] });
      
      this.calculateIDF();
      this.documents.forEach(doc => {
        doc.vector = this.calculateVector(doc.terms);
      });
    }
  
    public search(query: string, limit: number = 10): { id: string; score: number }[] {
      const queryTerms = this.preprocessText(query);
      const queryFreq = this.calculateTermFrequency(queryTerms);
      const queryVector = this.calculateVector(queryFreq);
  
      const results = this.documents.map(doc => ({
        id: doc.id,
        score: this.cosineSimilarity(queryVector, doc.vector)
      }));
  
      return results
        .sort((a, b) => b.score - a.score)
        .filter(result => result.score > 0)
        .slice(0, limit);
    }
  }
