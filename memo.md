.github/actions/claude-code-action/action.yml
97行目
uses: anthropics/claude-code-base-action@beta


.github/actions/claude-code-base-action/src/validate-env.ts
エラーではなく、処理継続するように変更

  if (errors.length > 0) {
    const errorMessage = `Environment variable validation failed:\n${errors.map((e) =>`  - ${e}`).join("\n")}`;
    console.error(errorMessage);
  }

.github/workflows/claude.yml
.claude.jsonをコピーする処理を追加