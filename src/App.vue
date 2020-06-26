<template>
  <div>
    <h1>hello world</h1>
    <h2>
      <span>count is {{count}}</span>
      <button @click="count++">点击</button>
    </h2>
  </div>
</template>

<script>
export default {
  data: () => ({
    count: 0
  })
};
</script>
