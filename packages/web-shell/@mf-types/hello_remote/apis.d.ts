
    export type RemoteKeys = 'hello_remote/HelloRemote';
    type PackageType<T> = T extends 'hello_remote/HelloRemote' ? typeof import('hello_remote/HelloRemote') :any;