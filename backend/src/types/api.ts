/** Single item returned from search; expand as domains stabilize. */
export type SearchResultItem = {
  id: string;
  title: string;
  snippet?: string;
};

export type SearchResponse = {
  query: {
    q: string;
    /** Present once questionnaire flow persists session → search. */
    questionnaireSessionId?: string;
  };
  results: SearchResultItem[];
  total: number;
};

export type HomeResponse = {
  headline: string;
  subheading: string;
  primaryCta: { label: string; href: string };
};

export type HealthResponse = {
  status: "ok";
  service: string;
};

export type QuestionnaireStubResponse = {
  implemented: false;
  message: string;
  next: {
    method: "GET";
    path: "/search";
    description: string;
  };
};
