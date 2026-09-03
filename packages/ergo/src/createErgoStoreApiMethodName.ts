import { assertInternalSelectorKey, assertPublicSelectorKey } from './selectorValidation';

export const createErgoStoreApiMethodName = (prefix: string, selectorName: string) => {
  assertPublicSelectorKey(selectorName);

  return `${prefix}${selectorName.charAt(0).toUpperCase()}${selectorName.slice(1)}`;
};

export const createErgoStoreInternalApiMethodName = (prefix: string, selectorName: string) => {
  assertInternalSelectorKey(selectorName);

  const match = selectorName.match(/^(_+)(.+)$/);

  if (!match) {
    throw new Error(`Invalid internal Ergo store selector name "${selectorName}".`);
  }

  const [, underscorePrefix, nameSuffix] = match;

  return `${underscorePrefix}${prefix}${nameSuffix.charAt(0).toUpperCase()}${nameSuffix.slice(1)}`;
};
