<script lang="ts">
    import Sortable from 'sortablejs';

    let items = [
        [
            {id: 1,name: "one"},
            {id: 2,name: "two"},
        ],
        [
            {id: 3,name: "three"},
            {id: 4,name: "four"},
        ]
    ]

    function initSortable(list, index) {
        const sortable = new Sortable(list, {
            group: "list",
            onSort() {
                const order = sortable.toArray()
                const allItems = items.flat()
                items[index] = order.map(id => {
                    return allItems.find(item => item.id == id)
                })
            },
        });
    }
</script>

{#each items as category, i}
    <h2>Category {i}</h2>
    <ul use:initSortable={i} >
        {#each category as item (item.id)}
            <li data-id={item.id} style="border: black solid 1px">{item.name}</li>
        {/each}
    </ul>
{/each}

{JSON.stringify(items)}
