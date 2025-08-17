package ethgo

type NFTInfo struct {
	ContractAddress string `json:"contract_address"`
	TokenID         string `json:"token_id"`
	TokenURI        string `json:"token_uri"`
	Name            string `json:"name"`
	Symbol          string `json:"symbol"`
	Owner           string `json:"owner"`
	TokenType       string `json:"token_type"` // ERC-721 or ERC-1155
	Balance         string `json:"balance"`    // For ERC-1155, this is the balance of the token
}

type NFTCollection struct {
	ContractAddress string     `json:"contract_address"`
	Name            string     `json:"name"`
	Symbol          string     `json:"symbol"`
	TokenType       string     `json:"token_type"`
	TokenCount      int        `json:"token_count"`
	Tokens          []*NFTInfo `json:"tokens"`
}

type NFTResponse struct {
	Address     string           `json:"address"`
	Collections []*NFTCollection `json:"collections"`
	TotalTokens int              `json:"total_tokens"`
}
