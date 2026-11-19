export const grammar = `code     = [product "-"] segment *("-" segment)
segment  = "" | entry *("." entry) | text
entry    = 1*(A-Z / a-z / 0-9)
text     = encodeURIComponent(text) with "-" → %2D and "." → %2E`;

export const usage = `<script>
  import { connectUrlState } from '#blocks/url-state';

  const disconnect = connectUrlState({
    spec: {
      product: 'RING01',
      groups: [
        { name: 'ring-finish', mode: 'single', options: ['SV', 'GD', 'RG'] },
        { name: 'ring-extras', mode: 'multiple', options: ['GW', 'IN', 'EX', 'CD'] },
        { name: 'ring-engraving', mode: 'text' },
      ],
    },
    param: 'code',
  });
</script>`;

export const pureUsage = `import { decode, encode, validateCombinationSpec } from '~/utils/combinationCode';

validateCombinationSpec(spec);
const code = encode(spec, { 'ring-finish': [{ code: 'GD' }], 'ring-extras': [], 'ring-engraving': [] });
const result = decode(spec, code);
if (result.ok) result.selections.get('ring-finish'); // [{ code: 'GD' }]`;
