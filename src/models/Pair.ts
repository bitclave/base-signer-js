export default class Pair<K, V> {

    public readonly first: K;
    public readonly second: V | undefined;

    constructor(first: K, second: V | undefined) {
        this.first = first;
        this.second = second;
    }
}
