import { genSimplify } from "./simplify";
import { genUnlikeAdd } from "./unlikeAdd";
import { genUnlikeSub } from "./unlikeSub";
import { genMultiply } from "./multiply";
import { genDivide } from "./divide";
import { genCompare } from "./compare";
import { genEquivalent } from "./equivalent";

export const NEW_GENS = {
  simplify: genSimplify,
  unlikeAdd: genUnlikeAdd,
  unlikeSub: genUnlikeSub,
  multiply: genMultiply,
  divide: genDivide,
  compare: genCompare,
  equivalent: genEquivalent,
};

export {
  genSimplify, genUnlikeAdd, genUnlikeSub,
  genMultiply, genDivide, genCompare, genEquivalent,
};
