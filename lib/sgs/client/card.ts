import { Card, CardProps } from 'cards/card';

type ClientCardProps = CardProps & {
    imagePath: string,
}

export abstract class ClientCard extends Card {
    protected imagePath: string;

    constructor(props: ClientCardProps) {
        const { imagePath, ...baseProps } = props;
        super(baseProps);

        this.imagePath = imagePath;
    }
}
